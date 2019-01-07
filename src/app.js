'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Alice, Reply, Stage, Scene } = require('yandex-dialogs-sdk');
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
      const jsonAnswer = await alice.handleRequest(req.body);
      res.json(jsonAnswer);
      // const handleResponseCallback = response => res.send(response);
      // const replyMessage = await alice.handleRequest(req.body, handleResponseCallback);
    });
    return app;
  }

  // эту функцию можно ставить ендпойнтом на aws lambda
  handlerLambda(event, context, callback) {
    const body = JSON.parse(event.body);
    alice.handleRequest(body, res => {
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

    // добавляют функции в ctx
    alice.use(middlewares.confirm());
    alice.use(middlewares.replySimple());
    alice.use(middlewares.replyRandom());
    alice.use(middlewares.logMessage());

    // изменяют ctx во время запроса
    alice.use(middlewares.store());
    alice.use(middlewares.corrector());
    alice.use(middlewares.cleaner());
    alice.use(middlewares.counter());

    await utils.initMorph();

    // при наличии session.confirm запускаем сценарий подтверждения
    alice.command(matchers.confirm(), commands.confirm);

    // ошибка с базой данных
    alice.command(matchers.error(), ctx => {
      console.log('! database error');
      return ctx.replyRandom([
        'Ой, что-то мне нехорошо, зайдите попозже...',
        'Пятьсоттретья ошибка, позовите админа! Хотя он уже наверное в курсе.',
        'Какой сейчас год? Кто я? Я потеряла память...'
      ]);
    });

    // привет
    alice.command(['', 'привет', 'приветствие'], commandsHelp.welcome);

    // тестовые команды, работают на продакшене
    alice.command('демо данные', ctx => {
      ctx.logMessage(`> ${ctx.message} (demoData confirm)`);
      ctx.confirm('Точно?', commands.demoData, ctx => ctx.reply('Как хочешь'));
    });

    alice.command('забудь все вообще', ctx => {
      ctx.logMessage(`> ${ctx.message} (clearDataAll confirm)`);
      return ctx.confirm('Точно?', commands.clearDataAll, ctx => ctx.reply('Как хочешь'));
    });

    // запомни ...
    const inAnswerStage = new Stage();
    const inAnswerScene = new Scene('in-answer', { fuseOptions });
    inAnswerScene.command(/^отмена/i, commands.cancel);
    inAnswerScene.command(matchers.rememberSentence(), commands.remember);
    inAnswerScene.any(commands.inAnswerProcess);
    alice.command('запомни', commands.inAnswerEnter);
    inAnswerStage.addScene(inAnswerScene);
    alice.use(inAnswerStage.getMiddleware());

    // меня зовут ...
    alice.command(
      ctx => (ctx.message.match(/^меня зовут /) ? 1 : 0),
      ctx => {
        return Reply.text('Боитесь забыть своё имя? Я не буду это запоминать!');
      }
    );

    // команда запомни ...
    alice.command(matchers.rememberSentence(), commands.remember);

    // команды
    alice.command('команды', commands.commands);

    // отмена
    alice.command(/^отмена/i, commands.cancel);

    // пока
    alice.command(matchers.goodbye(), commands.sessionEnd);

    // Алиса
    alice.command(/(алиса|алису)/i, ctx =>
      ctx.reply('Чтобы вернуться к Алисе, скажите "Алиса вернись"')
    );

    // оскорбление
    alice.command(matchers.abuse(), ctx =>
      ctx.reply('Я быстро учусь, вернитесь через пару дней и убедитесь!')
    );

    // забудь все, должно быть перед "удали последнее"
    alice.command(
      ['забудь всё', 'забудь все', 'удали все', 'забыть все', 'сотри все', 'стереть все'],
      ctx => ctx.confirm('Точно?', commands.clearData, ctx => ctx.reply('Как хочешь'))
    );

    // удали последнее
    alice.command(
      /^(удали последнее|забудь последнее|забудь последнюю запись|удали|удалить|забудь)$/i,
      commands.deleteLast
    );
    alice.command(/(забудь |удали(ть)? )(что )?.*/, commands.deleteQuestion);

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
      ['что ты знаешь', 'что ты помнишь', 'ты знаешь', 'что ты запомнила'],
      commands.known
    );

    // ниже все команды про помощь
    alice.command('тур', commandsHelp.tour);
    alice.command(['первая помощь', '1 помощь'], commandsHelp.firstHelp);

    // помощь
    alice.command(matchers.help(), commandsHelp.help);

    alice.command(['запоминать', 'как запомнить', 'как запоминать'], commandsHelp.remember);
    alice.command(['отвечать что', 'отвечает что', 'что'], commandsHelp.whatis);
    alice.command(['отвечать где', 'где'], commandsHelp.whereis);
    alice.command(['забывать', 'как забывать', 'как забыть'], commandsHelp.forget);

    alice.command(
      [
        ...['сценарии', 'примеры', 'примеры использования'],
        ...[
          'виртуальные подписи',
          'помощь мастеру',
          'список покупок',
          'расписание',
          'показания счетчиков',
          'запомни номер'
        ]
      ],
      commandsHelp.scenarios
    );

    // самые общие команды должны быть в конце
    // что ...
    alice.command(/^(что|кто) /, commands.whatIs);
    // где ...
    alice.command(/^(где|когда|в чем) /, commands.whereIs);
    // непонятное
    alice.command(/^(как|зачем|почему) /, commands.dontKnow);

    alice.any(commandsHelp.any);
  }

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }
}

module.exports = YandexDialogsWhatis;
