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
const useCommand = (alice, command) => {
  alice.command(command.matcher, command.handler);
};

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
    useCommand(alice, commands.core.error);

    // привет
    useCommand(alice, commands.core.greetings);

    // отмена
    useCommand(alice, commands.core.cancel);

    // пока
    useCommand(alice, commands.core.sessionEnd);

    // Алиса
    useCommand(alice, commands.core.alice);

    // запусти навык 2 память
    useCommand(alice, commands.core.selfRun);

    // версия
    useCommand(alice, commands.core.version);

    // оскорбление
    useCommand(alice, commands.core.abuse);

    // спасибо
    useCommand(alice, commands.core.thankyou);

    // молодец
    useCommand(alice, commands.core.compliment);

    // что нового, changelog
    useCommand(alice, commands.core.changelog);



    // что ты знаешь
    useCommand(alice, commands.items.known);

    // меня зовут ... , должен быть перед commands.items.remember
    useCommand(alice, commands.items.myName);

    // команда запомни ...
    useCommand(alice, commands.items.remember);

    // забудь все, должно быть перед "удали последнее"
    useCommand(alice, commands.items.clearData);

    // забудь все вообще
    useCommand(alice, commands.items.clearDataAll);

    // демо данные
    useCommand(alice, commands.items.demoData);

    // удали последнее
    useCommand(alice, commands.items.deleteLast);

    // удали конкретное
    useCommand(alice, commands.items.deleteQuestion);

    // запомни ...
    const inAnswerStage = new Stage();
    const inAnswerScene = new Scene('in-answer', { fuseOptions });
    useCommand(inAnswerScene, commands.core.cancel);
    useCommand(inAnswerScene, commands.items.remember);
    inAnswerScene.any(commands.inAnswerProcess);
    alice.command('запомни', commands.inAnswerEnter);
    inAnswerStage.addScene(inAnswerScene);
    alice.use(inAnswerStage.getMiddleware());



    // ниже все команды про помощь
    useCommand(alice, commands.help.tour);
    useCommand(alice, commands.help.firstHelp);

    // помощь
    useCommand(alice, commands.help.help);

    // команды
    useCommand(alice, commands.help.commands);

    useCommand(alice, commands.help.remember);
    useCommand(alice, commands.help.whatis);
    useCommand(alice, commands.help.whereis);
    useCommand(alice, commands.help.forget);

    // примеры использования
    useCommand(alice, commands.help.scenarios);



    // самые общие команды должны быть в конце
    // что ...
    useCommand(alice, commands.items.whatIs);
    // где ...
    useCommand(alice, commands.items.whereIs);
    // непонятное
    useCommand(alice, commands.core.dontKnow); // должна быть после всех "как"

    alice.any(commands.core.any.handler);
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
