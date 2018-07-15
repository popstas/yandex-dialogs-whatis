'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const storeMiddleware = require('./middlewares/storeMiddleware');
const correctorMiddleware = require('./middlewares/correctorMiddleware');
const cleanerMiddleware = require('./middlewares/cleanerMiddleware');
const matchers = require('./matchers');
const fuseOptions = {
  keys: ['name'],
  threshold: 0.3,
  maxPatternLength: 50,
  location: 68
};
const config = require('./config');
const commands = require('./commands/index');
const helpers = require('./helpers');
const utils = require('./utils');
const commandsHelp = require('./commands/help');

const alice = new Alice({ fuseOptions });
alice.use(storeMiddleware());
alice.use(correctorMiddleware());
alice.use(cleanerMiddleware());

class YandexDialogsWhatis {
  constructor() {
    this.init();
  }

  // returns express instance
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

  // эту функцию можно ставить ендпойнтом на aws lambda
  handlerLambda(event, context, callback) {
    const body = JSON.parse(event.body);
    alice.handleRequestBody(body, res => {
      callback(null, res);
    });
  }

  async init() {
    await utils.initMorph();

    // что ...
    alice.command(/^(что|кто) /, commands.whatIs);

    // где ...
    alice.command(/^(где|когда|в чем) /, commands.whereIs);

    // непонятное
    alice.command(/^(как|зачем|почему) /, commands.dontKnow);

    // запомни ...
    const inAnswer = new Scene('in-answer', { fuseOptions });
    inAnswer.enter(matchers.strings('запомни'), commands.inAnswerEnter);
    inAnswer.leave(matchers.strings('отмена'), commands.cancel);
    inAnswer.command(matchers.rememberSentence(), commands.remember);
    inAnswer.any(commands.inAnswerProcess);
    alice.registerScene(inAnswer);

    alice.command(matchers.rememberSentence(), commands.remember);

    alice.command(matchers.strings('команды'), commands.commands);

    if (process.env.NODE_ENV != 'production') {
      alice.command(matchers.strings('демо данные'), commands.demoData);
    }

    alice.command(matchers.strings('отмена'), commands.cancel);

    alice.command(
      matchers.strings([
        'пока',
        'отбой',
        'все',
        'всё',
        'хватит',
        'закройся',
        'выключить',
        'выключиcь'
      ]),
      commands.sessionEnd
    );

    alice.command(matchers.strings(['алиса']), ctx =>
      ctx.reply('Чтобы вернуться к Алисе, скажите "Алиса вернись"')
    );

    alice.command(/туп(ая|ой)/, ctx =>
      ctx.reply('Я быстро учусь, вернитесь через пару дней и убедитесь!')
    );

    alice.command(
      matchers.strings('удали последнее', 'забудь последнее', 'забудь последнюю запись'),
      commands.deleteLast
    );
    alice.command(/(забудь |удали(ть)? )(что )?.*/, commands.deleteQuestion);

    alice.command(matchers.strings(['забудь всё', 'забудь все']), commands.clearData);

    alice.command(
      matchers.strings(['спс', 'спасибо', 'благодарю']),
      helpers.replyRandom([
        'Всегда пожалуйста',
        'Не за что',
        'Обращайся!',
        'Пожалуйста',
        'Пожалуйста',
        'Пожалуйста',
        'Пожалуйста',
        'Пожалуйста'
      ])
    );

    alice.command(
      matchers.strings(['молодец', 'умница', 'отлично', 'прекрасно', 'круто']),
      helpers.replyRandom([
        'Спасибо, стараюсь :)',
        'Ой, так приятно )',
        'Ты же в курсе, что хвалишь бездушный алгоритм?',
        'Спасибо!',
        'Спасибо!',
        'Спасибо!',
        'Спасибо!',
        'Спасибо!'
      ])
    );

    // это ломает команды "удали последнее", "удали кокретное"
    // alice.command(['что ты знаешь', 'что ты помнишь'], commands.known);
    alice.command(
      matchers.strings(['что ты знаешь', 'что ты помнишь', 'ты знаешь']),
      commands.known
    );

    // это ломает команду "запомни что на дворе находится трава"
    // alice.command(['что ты умеешь', 'что ты можешь'], commands.help);
    alice.command(
      matchers.strings(['что ты умеешь', 'что ты можешь', 'помощь']),
      commandsHelp.help
    );
    alice.command(matchers.strings('запоминать'), commandsHelp.remember);
    alice.command(matchers.strings(['отвечать что', 'отвечает что']), commandsHelp.whatis);
    alice.command(matchers.strings('отвечать где'), commandsHelp.whereis);
    alice.command(matchers.strings('забывать'), commandsHelp.forget);

    alice.any(commandsHelp.any);

    alice.command(matchers.strings(['', 'привет', 'приветствие']), commandsHelp.welcome);
    // alice.welcome(commandsHelp.welcome);
  }

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }
}

module.exports = YandexDialogsWhatis;
