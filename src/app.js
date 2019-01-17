'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Alice, Stage, Scene, Reply } = require('yandex-dialogs-sdk');
const middlewares = require('./middlewares');
const packageJson = require('../package.json');
const defaultConfig = require('./config');
const commands = require('./commands');
const entities = require('./entities');
const utils = require('./utils');

const useCommand = commands.utils.useCommand;

const alice = new Alice();
class YandexDialogsWhatis {
  constructor(config = defaultConfig) {
    this.config = config;
    this.init();
  }

  async init() {
    // добавляют функции в ctx
    alice.use(middlewares.reply());
    alice.use(middlewares.replyRandom());
    alice.use(middlewares.az());
    alice.use(middlewares.logMessage());
    alice.use(middlewares.yametrika(this.config.YAMETRIKA_ID));
    alice.use(middlewares.chatbase(this.config.CHATBASE_KEY, packageJson.version));

    // изменяют ctx во время запроса
    alice.use(middlewares.store());
    alice.use(middlewares.corrector());
    alice.use(middlewares.cleaner());
    alice.use(middlewares.counter());

    alice.use(middlewares.confirm());

    alice.use(entities.shop());

    await utils.initMorph();

    useCommand(alice, commands.core.abuse); // оскорбление
    useCommand(alice, commands.core.alice); // Алиса
    useCommand(alice, commands.core.cancel); // отмена
    useCommand(alice, commands.core.changelog); // что нового, changelog
    useCommand(alice, commands.core.compliment); // молодец
    useCommand(alice, commands.core.confirm); // при наличии session.confirm запускаем сценарий подтверждения
    useCommand(alice, commands.core.dontKnow); // непонятное, должна быть после всех "как"
    useCommand(alice, commands.core.error); // ошибка с базой данных
    useCommand(alice, commands.core.greetings); // привет
    useCommand(alice, commands.core.repeat); // повтори
    useCommand(alice, commands.core.repeatInput); // что ты услышала
    useCommand(alice, commands.core.selfRun); // запусти навык 2 память
    useCommand(alice, commands.core.sessionEnd); // пока
    useCommand(alice, commands.core.thankyou); // спасибо
    useCommand(alice, commands.core.version); // версия

    useCommand(alice, commands.items.clearData); // забудь все, должен быть перед commands.items.clearDataAll
    useCommand(alice, commands.items.clearDataAll); // забудь все вообще, должен быть перед commands.items.deleteQuestion
    useCommand(alice, commands.items.deleteLast); // удали последнее, должен быть перед commands.items.shopList
    useCommand(alice, commands.items.deleteQuestion); // удали конкретное, должен быть перед commands.items.shopList
    useCommand(alice, commands.items.demoData); // демо данные
    useCommand(alice, commands.items.howMany); // команда сколько ...
    useCommand(alice, commands.items.known); // что ты знаешь
    useCommand(alice, commands.items.myName); // меня зовут ... , должен быть перед commands.items.remember
    useCommand(alice, commands.items.remember); // команда запомни ...
    useCommand(alice, commands.items.shopList); // список покупок, должен идти перед commands.items.deleteQuestion
    useCommand(alice, commands.items.whatIs); // что ...
    useCommand(alice, commands.items.whereIs); // где ...

    // запомни ...
    const rememberMasterStage = new Stage();
    const rememberMasterScene = new Scene('rememberMaster');
    useCommand(rememberMasterScene, commands.core.cancel);
    useCommand(rememberMasterScene, commands.items.remember);
    rememberMasterScene.any(commands.items.rememberMaster.rememberMasterProcess);
    rememberMasterStage.addScene(rememberMasterScene);
    alice.use(rememberMasterStage.getMiddleware());
    useCommand(alice, commands.items.rememberMaster);

    useCommand(alice, commands.help.tour); // тур
    useCommand(alice, commands.help.first); // первая помощь
    useCommand(alice, commands.help.help); // помощь
    useCommand(alice, commands.help.commands); // команды
    useCommand(alice, commands.help.remember); // запоминать
    useCommand(alice, commands.help.whatis); // отвечать что
    useCommand(alice, commands.help.whereis); // отвечать где
    useCommand(alice, commands.help.forget); // забывать
    useCommand(alice, commands.help.scenarios); // примеры

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
