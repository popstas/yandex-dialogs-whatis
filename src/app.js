'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Alice, Stage, Scene } = require('yandex-dialogs-sdk');
const middlewares = require('./middlewares');
const matchers = require('./matchers');
const packageJson = require('../package.json');
const fuseOptions = {
  keys: ['name'],
  threshold: 0.3,
  maxPatternLength: 50,
  location: 68
};
const defaultConfig = require('./config');
const commands = require('./commands');
const utils = require('./utils');

const alice = new Alice({ fuseOptions });

// подключение команд, которые возвращают { matcher, handler }
const useCommand = (alice, command) => alice.command(command.matcher, command.handler);

class YandexDialogsWhatis {
  constructor(config = defaultConfig) {
    this.config = config;
    this.init();
  }

  async init() {
    // добавляют функции в ctx
    alice.use(middlewares.confirm());
    alice.use(middlewares.replySimple());
    alice.use(middlewares.replyRandom());
    alice.use(middlewares.logMessage());
    alice.use(middlewares.yametrika(this.config.YAMETRIKA_ID));
    alice.use(middlewares.chatbase(this.config.CHATBASE_KEY, packageJson.version));

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
    useCommand(alice, commands.core.greetings);

    // демо данные
    alice.command('демо данные', ctx => {
      ctx.chatbase.setIntent('demoDataConfirm');
      ctx.logMessage(`> ${ctx.message} (demoData confirm)`);

      return ctx.confirm('Точно?', commands.demoData, ctx => ctx.reply('Как хочешь'));
    });

    // забудь все вообще
    alice.command('забудь все вообще', ctx => {
      ctx.chatbase.setIntent('clearDataAllConfirm');
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
        ctx.chatbase.setIntent('myName');
        ctx.chatbase.setNotHandled();
        ctx.logMessage(`> ${ctx.message} (myName)`);

        return ctx.reply('Боитесь забыть своё имя? Я не буду это запоминать!');
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
    alice.command(/(алиса|алису)/i, ctx => {
      ctx.chatbase.setIntent('alice');
      ctx.chatbase.setNotHandled();
      ctx.logMessage(`> ${ctx.message} (alice)`);

      return ctx.reply('Чтобы вернуться к Алисе, скажите "Алиса вернись"');
    });

    // запусти навык 2 память
    alice.command('запусти навык 2 память', ctx => {
      ctx.chatbase.setIntent('selfRun');
      ctx.logMessage(`> ${ctx.message} (selfRun)`);

      return ctx.reply('Я уже тут');
    });

    // версия
    alice.command('версия', ctx => {
      ctx.chatbase.setIntent('version');
      ctx.logMessage(`> ${ctx.message} (version)`);

      return ctx.reply(packageJson.version, [], {
        tts: packageJson.version.split('.').join(' точка ')
      });
    });

    // оскорбление
    alice.command(matchers.abuse(), ctx => {
      ctx.chatbase.setIntent('abuse');
      ctx.chatbase.setNotHandled();
      ctx.chatbase.setAsFeedback();
      ctx.logMessage(`> ${ctx.message} (abuse)`);

      return ctx.replyRandom([
        'Вот сейчас обидно было...',
        'Я быстро учусь, вернитесь через пару дней и убедитесь...',
        'Я такая тупая...'
      ]);
    });

    // что нового, changelog
    alice.command('что нового', commands.changelog);

    // забудь все, должно быть перед "удали последнее"
    alice.command(
      ['забудь всё', 'забудь все', 'удали все', 'забыть все', 'сотри все', 'стереть все'],
      ctx => {
        ctx.chatbase.setIntent('clearDataConfirm');
        ctx.logMessage(`> ${ctx.message} (clearData confirm)`);

        return ctx.confirm('Точно?', commands.clearData, ctx => ctx.reply('Как хочешь'));
      }
    );

    // удали последнее
    alice.command(
      /^(удали|удалить|забудь) ?(последнее|последний|последние|последнюю запись)?$/i,
      commands.deleteLast
    );
    alice.command(/(забудь |удали(ть)? )(что )?.*/, commands.deleteQuestion);

    // спасибо
    alice.command(matchers.thankyou(), ctx => {
      ctx.chatbase.setAsFeedback();
      ctx.chatbase.setIntent('thankyou');
      ctx.logMessage(`> ${ctx.message} (thankyou)`);

      return ctx.replyRandom([
        'Всегда пожалуйста',
        'Не за что',
        'Обращайся!',
        'Пожалуйста',
        'Пожалуйста',
        'Пожалуйста',
        'Пожалуйста',
        'Пожалуйста'
      ]);
    });

    // молодец
    alice.command(matchers.compliment(), ctx => {
      ctx.chatbase.setAsFeedback();
      ctx.chatbase.setIntent('compliment');
      ctx.logMessage(`> ${ctx.message} (compliment)`);

      return ctx.replyRandom([
        'Спасибо, стараюсь :)',
        'Ой, так приятно )',
        'Спасибо!',
        'Спасибо!',
        'Спасибо!',
        'Спасибо!',
        'Спасибо!'
      ]);
    });

    // это ломает команды "удали последнее", "удали кокретное"
    // alice.command(['что ты знаешь', 'что ты помнишь'], commands.known);
    alice.command(
      [
        'что ты знаешь',
        'что ты помнишь',
        'ты знаешь',
        'что ты запомнила',
        'что ты поняла',
        'что ты хочешь'
      ],
      commands.known
    );

    // ниже все команды про помощь
    alice.command('тур', commands.help.tour);
    alice.command(['первая помощь', '1 помощь'], commands.help.firstHelp);

    // помощь
    alice.command(matchers.help(), commands.help.help);
    alice.command(['запоминать', 'как запомнить', 'как запоминать'], commands.help.remember);
    alice.command(['отвечать что', 'отвечает что', 'что'], commands.help.whatis);
    alice.command(['отвечать где', 'где'], commands.help.whereis);
    alice.command(['забывать', 'как забывать', 'как забыть'], commands.help.forget);

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
      commands.help.scenarios
    );

    // самые общие команды должны быть в конце
    // что ...
    alice.command(/^(что|кто) /, commands.whatIs);
    // где ...
    alice.command(/^(где|когда|в чем) /, commands.whereIs);
    // непонятное
    alice.command(/^(как|зачем|почему) /, commands.dontKnow);

    alice.any(commands.help.any);
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
    app.post(this.config.API_ENDPOINT, async (req, res) => {
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

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }
}

module.exports = YandexDialogsWhatis;
