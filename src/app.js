'use strict'

const Alice = require('./yandex-dialogs-sdk');
const Scene = require('./yandex-dialogs-sdk').Scene;
const alice = new Alice();
const Fuse = require('fuse.js');
const storage = require('./storage.js');

const PORT = process.env.BASE_URL || 3002;

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

class YandexDialogsWhatis {
  constructor() {
    this.stags = STAGE_IDLE;
    this.question = '';
    this.answer = '';
    this.lastAddedItem = {};

    this.init();
  }

  handleRequestBody(event, context) {
    return alice.handleRequestBody(event);
  }

  async init() {
    await storage.connect();

    alice.command(/^что /, ctx => {
      console.log('> question: ', ctx.messsage);
      return storage.getUserData(ctx, (ctx, userData) => {
        return this.processQuestion(ctx, userData);
      });
    });

    const inAnswer = new Scene('in-answer');
    inAnswer.enter('запомни', ctx => {
      console.log('> answer begin: ', ctx.messsage);
      return storage.getUserData(ctx, (ctx, userData) => {
        let reply = this.processAnswer(ctx, userData);
        return ctx.reply(reply);
      });
    });
    inAnswer.leave('отмена', ctx => {
      console.log('> answer cancel: ', ctx.messsage);
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      return ctx.reply('Всё отменено');
    });
    inAnswer.any(ctx => {
      console.log('> answer end: ', ctx.messsage);
      return storage.getUserData(ctx, (ctx, userData) => {
        let reply = this.processAnswer(ctx, userData);
        if (this.stage == STAGE_IDLE) {
          const session = alice.sessions.findById(ctx.sessionId);
          session.currentScene = null;
        }
        return ctx.reply(reply);
      });
    });
    alice.registerScene(inAnswer);

    alice.command('запомни ${question} находится ${answer}', ctx => {
      console.log('> full answer: ', ctx.messsage);
      storage.getUserData(ctx, async (ctx, userData) => {
        const { question, answer } = ctx.body;
        this.stage = STAGE_IDLE;
        await storage.storeAnswer(userData, question, answer);
        return ctx.reply(question + ' находится ' + answer + ', поняла');
      });
    });

    alice.command(/^демо данные$/, ctx => {
      console.log('> demo data');
      storage.getUserData(ctx, async (ctx, userData) => {
        await storage.fillDemoData(userData);
        ctx.reply('Данные сброшены на демонстрационные');
      });
    });

    alice.command('отмена', ctx => {
      console.log('> cancel');
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      ctx.reply('Всё отменено');
    });

    alice.command('удалить', ctx => {
      console.log('> remove');
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      this.deleteItem(ctx, this.lastAddedItem);
      return ctx.reply('Удален ответ: ' + this.lastAddedItem.questions.join(', '));
    });

    alice.any(ctx => {
      console.log('> default');
      storage.getUserData(ctx, (ctx, userData) => {
        return this.processHelp(ctx, userData);
      });
    });

    /*
    https://github.com/fletcherist/yandex-dialogs-sdk/issues/8
    alice.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    }); */
  }

  createApp(callbackUrl = '/') {
    this.app = alice.createApp(callbackUrl);
    return this.app;
  }

  run() {
    alice.listen('/', PORT);
    console.log('listen ' + PORT);
  }

  async processHelp(ctx, userData) {
    const replyMessage = ctx.replyBuilder;
    const helpText = [
      'Я умею запоминать, что где лежит и напоминать об этом.',
      'Начните фразу со "что", чтобы получить ответ. Например: "что в синем".',
      'Скажите "запомни", чтобы добавить новый ответ.',
      'Можно быстро добавить новый ответ так: "запомни ... находится ..."'
    ];

    const data = await storage.getData(userData);
    let questions = data.map(item => item.questions[0]);
    questions = questions.map(question => {
      const btn = ctx.buttonBuilder.text('что ' + question);
      replyMessage.addButton({ ...btn.get() });
    });

    if (questions.length > 0) {
      helpText.push('');
      helpText.push('У меня есть информация об этих объектах:');
    }
    replyMessage.text(helpText.join('\n'));
    console.log('reply message: ', replyMessage.get());
    ctx.reply(replyMessage.get());
  }

  async processQuestion(ctx, userData) {
    const q = ctx.messsage.replace(/^что /, '');
    const data = await storage.getData(userData);

    let fuse = new Fuse(data, {
      includeScore: true,
      keys: [
        {
          name: 'questions',
          weight: 0.7
        },
        {
          name: 'answer',
          weight: 0.1
        }
      ]
    });
    let answers = fuse.search(q);
    if (answers.length > 0) {
      const bestScore = answers[0].score;
      const scoreThreshold = 2;
      answers = answers.map(answer => {
        return {
          ...answer.item,
          ...{
            score: answer.score,
            minor: answer.score / bestScore > scoreThreshold
          }
        };
      });

      let msg = answers[0].answer;
      if (answers.filter(answer => !answer.minor).length > 1) {
        msg += ', но это неточно';
      }

      console.log('answer: ', msg);
      ctx.reply(msg);
    } else {
      ctx.reply('Я не понимаю');
    }
  }

  async processAnswer(ctx, userData) {
    const q = ctx.messsage.replace(/^запомни/, '').trim();
    const data = await storage.getData(userData);
    const replyMessage = ctx.replyBuilder;

    if (this.stage == STAGE_IDLE) {
      this.question = q;
      this.answer = '';

      if (this.question != '') {
        replyMessage.text('Что находится ' + this.question + '?');
        this.stage = STAGE_WAIT_FOR_ANSWER;
      } else {
        replyMessage.text('Что запомнить?');
      }
    } else if (this.stage == STAGE_WAIT_FOR_ANSWER) {
      this.answer = q;
      this.lastAddedItem = {
        questions: [this.question],
        answer: this.answer
      };

      this.stage = STAGE_IDLE;
      await storage.storeAnswer(userData, this.question, this.answer);

      replyMessage.text(this.question + ' находится ' + this.answer + ', поняла');
    }

    return replyMessage.get();
  }


  deleteItem(ctx, answer, userData) {
    console.log('deleteItem', ctx, userData);
  }
}

module.exports = YandexDialogsWhatis;