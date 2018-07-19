'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const middlewares = require('./middlewares');
const matchers = require('./matchers');
const fuseOptions = {
  keys: ['name'],
  threshold: 0.3,
  maxPatternLength: 50,
  location: 68
};
const config = require('./config');
const commands = require('./commands/index');
const utils = require('./utils');
const commandsHelp = require('./commands/help');

const alice = new Alice({ fuseOptions });

// изменяют ctx во время запроса
alice.use(middlewares.store());
alice.use(middlewares.corrector());
alice.use(middlewares.cleaner());

// добавляют функции в ctx
alice.use(middlewares.confirm());
alice.use(middlewares.replyRandom());
alice.use(middlewares.replySimple());

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

    // при наличии session.confirm запускаем сценарий подтверждения
    alice.command(matchers.confirm(), commands.confirm);

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
      alice.command(matchers.strings('забудь все вообще'), ctx =>
        ctx.confirm('Точно?', commands.clearDataAll, ctx => ctx.reply('Как хочешь'))
      );
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
      matchers.strings(
        'удали последнее',
        'забудь последнее',
        'забудь последнюю запись',
        'удали',
        'удалить',
        'забудь'
      ),
      commands.deleteLast
    );
    alice.command(/(забудь |удали(ть)? )(что )?.*/, commands.deleteQuestion);

    alice.command(matchers.strings(['забудь всё', 'забудь все', 'удали все']), ctx =>
      ctx.confirm('Точно?', commands.clearData, ctx => ctx.reply('Как хочешь'))
    );

    alice.command(matchers.strings(['спс', 'спасибо', 'благодарю']), ctx =>
      ctx.replyRandom([
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

    alice.command(matchers.strings(['молодец', 'умница', 'отлично', 'прекрасно', 'круто']), ctx =>
      ctx.replyRandom([
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
      matchers.strings(['что ты знаешь', 'что ты помнишь', 'ты знаешь', 'что ты запомнила']),
      commands.known
    );

    // помощь
    alice.command(matchers.strings('тур'), commandsHelp.tour);
    alice.command(matchers.strings('первая помощь'), commandsHelp.firstHelp);
    alice.command(
      matchers.strings(['что ты умеешь', 'что ты можешь', 'помощь']),
      commandsHelp.help
    );
    alice.command(
      matchers.strings(['запоминать', 'как запомнить', 'как запоминать']),
      commandsHelp.remember
    );
    alice.command(matchers.strings(['отвечать что', 'отвечает что', 'что']), commandsHelp.whatis);
    alice.command(matchers.strings(['отвечать где', 'где']), commandsHelp.whereis);
    alice.command(
      matchers.strings(['забывать', 'как забывать', 'как забыть']),
      commandsHelp.forget
    );

    alice.command(
      matchers.strings([
        ...['сценарии', 'примеры', 'примеры использования'],
        ...[
          'виртуальные подписи',
          'помощь мастеру',
          'список покупок',
          'расписание',
          'показания счетчиков',
          'запомни номер'
        ]
      ]),
      commandsHelp.scanarios
    );
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
