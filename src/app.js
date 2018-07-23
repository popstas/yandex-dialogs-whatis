'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const middlewares = require('./middlewares');
const { loggingMiddleware } = Alice;
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
    // используют данные на стороне
    /* alice.use(
      loggingMiddleware({
        level: 1
      })
    ); */

    // изменяют ctx во время запроса
    alice.use(middlewares.store());
    alice.use(middlewares.corrector());
    alice.use(middlewares.cleaner());

    // добавляют функции в ctx
    alice.use(middlewares.confirm());
    alice.use(middlewares.replyRandom());
    alice.use(middlewares.replySimple());

    await utils.initMorph();

    // при наличии session.confirm запускаем сценарий подтверждения
    alice.command(matchers.confirm(), commands.confirm);

    // ошибка с базой данных
    alice.command(matchers.error(), ctx => {
      console.log('! database error');
      return ctx.reply('Ой, что-то мне нехорошо, зайдите попозже...');
    });

    // привет
    alice.command(matchers.strings(['', 'привет', 'приветствие']), commandsHelp.welcome);

    // что ...
    alice.command(/^(что|кто) /, commands.whatIs);

    // где ...
    alice.command(/^(где|когда|в чем) /, commands.whereIs);

    // непонятное
    alice.command(/^(как|зачем|почему) /, commands.dontKnow);

    // запомни ...
    const inAnswer = new Scene('in-answer', { fuseOptions });
    inAnswer.enter(matchers.strings('запомни'), commands.inAnswerEnter);
    inAnswer.leave(/^отмена/i, commands.cancel);
    inAnswer.command(matchers.rememberSentence(), commands.remember);
    inAnswer.any(commands.inAnswerProcess);
    alice.registerScene(inAnswer);

    // команда запомни ...
    alice.command(matchers.rememberSentence(), commands.remember);

    // покажи последние диалоги
    alice.command(matchers.strings('покажи последние диалоги'), commands.remember);

    // команды
    alice.command(matchers.strings('команды'), commands.commands);

    // тестовые команды
    if (process.env.NODE_ENV != 'production') {
      alice.command(matchers.strings('демо данные'), commands.demoData);
      alice.command(matchers.strings('забудь все вообще'), ctx =>
        ctx.confirm('Точно?', commands.clearDataAll, ctx => ctx.reply('Как хочешь'))
      );
    }

    // отмена
    alice.command(/^отмена/i, commands.cancel);

    // пока
    alice.command(matchers.goodbye(), commands.sessionEnd);

    // Алиса
    alice.command(/алиса/i, ctx => ctx.reply('Чтобы вернуться к Алисе, скажите "Алиса вернись"'));

    // оскорбление
    alice.command(matchers.abuse(), ctx =>
      ctx.reply('Я быстро учусь, вернитесь через пару дней и убедитесь!')
    );

    alice.command(
      /^(удали последнее|забудь последнее|забудь последнюю запись|удали|удалить|забудь)$/i,
      commands.deleteLast
    );
    alice.command(/(забудь |удали(ть)? )(что )?.*/, commands.deleteQuestion);

    alice.command(matchers.strings(['забудь всё', 'забудь все', 'удали все']), ctx =>
      ctx.confirm('Точно?', commands.clearData, ctx => ctx.reply('Как хочешь'))
    );

    // спасибо
    alice.command(matchers.thankyou(), ctx =>
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

    // молодец
    alice.command(matchers.compliment(), ctx =>
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

    // ниже все команды про помощь

    alice.command(matchers.strings('тур'), commandsHelp.tour);
    alice.command(matchers.strings('первая помощь'), commandsHelp.firstHelp);

    // помощь
    alice.command(matchers.help(), commandsHelp.help);

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
      commandsHelp.scenarios
    );
    alice.any(commandsHelp.any);
  }

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }
}

module.exports = YandexDialogsWhatis;
