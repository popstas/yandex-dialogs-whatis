'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const alice = new Alice({
  fuseOptions: {
    key: ['name'],
    threshold: 0.3,
    distance: 10,
    location: 4
  }
});
const config = require('./config');
const storage = require('./storage');
const commands = require('./commands');

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

class YandexDialogsWhatis {
  constructor() {
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
    app.use(express.static('static'));
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
    alice.command(/^что /, commands.whatIs);

    // запомни ...
    const inAnswer = new Scene('in-answer');
    inAnswer.enter('запомни', async ctx => {
      console.log('> answer begin: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      ctx.state = await storage.getState(userData)
      const reply = await this.processAnswer(ctx, userData);
      return ctx.reply(reply);
    });
    inAnswer.leave('отмена', async ctx => {
      console.log('> answer cancel: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      ctx.state = await storage.getState(userData)
      ctx.state.stage = STAGE_IDLE;
      ctx.state.question = '';
      ctx.state.answer = '';
      storage.setState(userData, ctx.state);
      return ctx.reply('Всё отменено');
    });
    inAnswer.any(async ctx => {
      console.log('> answer end: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      ctx.state = await storage.getState(userData)
      const reply = await this.processAnswer(ctx, userData);
      if (ctx.state.stage == STAGE_IDLE) {
        const session = alice.sessions.findById(ctx.sessionId);
        session.setData('currentScene', null);
      }
      return ctx.reply(reply);
    });
    alice.registerScene(inAnswer);

    alice.command('запомни ${question} находится ${answer}', commands.remember);

    alice.command(/^команды$/, commands.commands);

    alice.command(/^демо данные$/, commands.demoData);

    alice.command('отмена', async ctx => {
      console.log('> cancel');
      const userData = await storage.getUserData(ctx);
      ctx.state = await storage.getState(userData)
      ctx.state.stage = STAGE_IDLE;
      ctx.state.question = '';
      ctx.state.answer = '';
      storage.setState(userData, ctx.state);
      ctx.reply('Всё отменено');
    });

    alice.command('пока', ctx => {
      console.log('> end');
      ctx.reply(
        ctx.replyBuilder
          .text('До свидания')
          .shouldEndSession(true)
          .get()
      );
    });

    alice.command('удалить', async ctx => {
      console.log('> remove');
      const userData = await storage.getUserData(ctx);
      ctx.state = await storage.getState(userData)
      ctx.state.stage = STAGE_IDLE;
      ctx.state.question = '';
      ctx.state.answer = '';
      storage.setState(userData, ctx.state);
      this.processDeleteItem(ctx, ctx.state.lastAddedItem);
      return ctx.reply('Удален ответ: ' + ctx.state.lastAddedItem.questions.join(', '));
    });

    alice.command('забудь всё', commands.clearData);

    alice.any(commands.help);
  }

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }

  async processAnswer(ctx, userData) {
    const q = ctx.messsage.replace(/^запомни/, '').trim();
    const replyMessage = ctx.replyBuilder;

    if (!ctx.state.stage || ctx.state.stage === STAGE_IDLE) {
      ctx.state.answer = '';

      if (q != '') {
        ctx.state.question = q;
        replyMessage.text('Что находится ' + q + '?');
        ctx.state.stage = STAGE_WAIT_FOR_ANSWER;
      } else {
        replyMessage.text('Что запомнить?');
      }
    } else if (ctx.state.stage === STAGE_WAIT_FOR_ANSWER) {
      ctx.state.answer = q;
      ctx.state.lastAddedItem = {
        questions: [ctx.state.question],
        answer: ctx.state.answer
      };

      ctx.state.stage = STAGE_IDLE;
      await storage.storeAnswer(userData, ctx.state.question, ctx.state.answer);

      replyMessage.text(ctx.state.question + ' находится ' + ctx.state.answer + ', поняла');
    }

    storage.setState(userData, ctx.state);
    return replyMessage.get();
  }

  processDeleteItem(ctx, answer, userData) {
    console.log('processDeleteItem', ctx, userData);
  }
}

module.exports = YandexDialogsWhatis;
