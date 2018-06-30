'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const alice = new Alice();
const config = require('./config');
const storage = require('./storage');
const commands = require('./commands');

// must match to AWS API Gateway endpoint

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

class YandexDialogsWhatis {
  constructor() {
    this.stage = STAGE_IDLE;
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
      const reply = await this.processAnswer(ctx, userData);
      return ctx.reply(reply);
    });
    inAnswer.leave('отмена', ctx => {
      console.log('> answer cancel: ', ctx.messsage);
      this.stage = STAGE_IDLE;
      this.question = '';
      this.answer = '';
      return ctx.reply('Всё отменено');
    });
    inAnswer.any(async ctx => {
      console.log('> answer end: ', ctx.messsage);
      const userData = await storage.getUserData(ctx);
      const reply = await this.processAnswer(ctx, userData);
      if (this.stage == STAGE_IDLE) {
        const session = alice.sessions.findById(ctx.sessionId);
        session.currentScene = null;
      }
      return ctx.reply(reply);
    });
    alice.registerScene(inAnswer);

    alice.command('запомни ${question} находится ${answer}', commands.remember);

    alice.command(/^команды$/, commands.commands);

    alice.command(/^демо данные$/, commands.demoData);

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
    const data = await storage.getData(userData);
    const replyMessage = ctx.replyBuilder;

    if (this.stage === STAGE_IDLE) {
      this.question = q;
      this.answer = '';

      if (this.question != '') {
        replyMessage.text('Что находится ' + this.question + '?');
        this.stage = STAGE_WAIT_FOR_ANSWER;
      } else {
        replyMessage.text('Что запомнить?');
      }
    } else if (this.stage === STAGE_WAIT_FOR_ANSWER) {
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
