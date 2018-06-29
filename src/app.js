'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const alice = new Alice();
const Fuse = require('fuse.js');
const config = require('./config');
const storage = require('./storage.js');

// must match to AWS API Gateway endpoint

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

  // for lambda, returns express instance
  handlerExpress() {
    const app = express();
    app.use(bodyParser.json());
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
    app.post(config.API_ENDPOINT, async (req, res) => {
      const handleResponseCallback = response => res.send(response);
      const replyMessage = await alice.handleRequestBody(req.body, handleResponseCallback);
    });
    return app;
  }

  handlerLambda(event, context, callback) {
    const body = JSON.parse(event.body);
    alice.handleRequestBody(body, res => {
      callback(null, res);
    });
  }

  init() {
    // что ...
    alice.command(/^что /, async ctx => {
      console.log('> question: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      return this.processQuestion(ctx, userData);
    });

    // запомни ...
    const inAnswer = new Scene('in-answer');
    inAnswer.enter('запомни', async ctx => {
      console.log('> answer begin: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      let reply = this.processAnswer(ctx, userData);
      return ctx.reply(reply);
    });
    inAnswer.leave('отмена', ctx => {
      console.log('> answer cancel: ', ctx.messsage);
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      return ctx.reply('Всё отменено');
    });

    // прочее
    inAnswer.any(async ctx => {
      console.log('> answer end: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      let reply = this.processAnswer(ctx, userData);
      if (this.stage == STAGE_IDLE) {
        const session = alice.sessions.findById(ctx.sessionId);
        session.currentScene = null;
      }
      return ctx.reply(reply);
    });
    alice.registerScene(inAnswer);

    alice.command('запомни ${question} находится ${answer}', async ctx => {
      console.log('> full answer: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      const { question, answer } = ctx.body;
      this.stage = STAGE_IDLE;
      await storage.storeAnswer(userData, question, answer);
      return ctx.reply(question + ' находится ' + answer + ', поняла');
    });

    alice.command(/^команды$/, ctx => {
      console.log('> commands');
      const commands = [
        'удалить',
        'забудь всё',
        'демо данные',
        'запомни в чем-то находится что-то',
        'отмена',
        'запомни'
      ];

      const replyMessage = ctx.replyBuilder;
      commands.map(command => {
        const btn = ctx.buttonBuilder.text(command).get();
        replyMessage.addButton({ ...btn });
      });
      // replyMessage.text('Вот что я умею:')
      ctx.reply(replyMessage.get());
    });

    alice.command(/^демо данные$/, async ctx => {
      console.log('> demo data');
      const userData = await storage.getUserData(ctx);
      await storage.fillDemoData(userData);
      ctx.reply('Данные сброшены на демонстрационные');
    });

    alice.command('отмена', ctx => {
      console.log('> cancel');
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      ctx.reply('Всё отменено');
    });

    alice.command('удалить', async ctx => {
      console.log('> remove');
      const userData = await storage.getUserData(ctx);
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      this.processDeleteItem(ctx, this.lastAddedItem);
      return ctx.reply('Удален ответ: ' + this.lastAddedItem.questions.join(', '));
    });

    alice.command('забудь всё', async ctx => {
      console.log('> clear');
      const userData = await storage.getUserData(ctx);
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      storage.clearData(userData);
      return ctx.reply('Всё забыла...');
    });

    alice.any(async ctx => {
      console.log('> default');
      const userData = await storage.getUserData(ctx);
      return this.processHelp(ctx, userData);
    });
  }

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }

  async processHelp(ctx, userData) {
    const replyMessage = ctx.replyBuilder;
    const helpText = [
      'Я умею запоминать, что где находится и напоминать об этом.',
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
    replyMessage.addButton(ctx.buttonBuilder.text('команды').get());

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

    if (data.length == 0) {
      return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
    }

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

  processDeleteItem(ctx, answer, userData) {
    console.log('processDeleteItem', ctx, userData);
  }
}

module.exports = YandexDialogsWhatis;
