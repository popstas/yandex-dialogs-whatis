'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Alice = require('yandex-dialogs-sdk');
const Scene = require('yandex-dialogs-sdk').Scene;
const storeMongoMiddleware = require('./middlewares/storeMongoMiddleware');
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
alice.use(storeMongoMiddleware());

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

  init() {
    // что ...
    alice.command(/^(Алиса )?(а )?(скажи )?что /, commands.whatIs);

    // где ...
    alice.command(/^(Алиса )?(а )?(скажи )??где /, commands.whereIs);

    // запомни ...
    const inAnswer = new Scene('in-answer', { fuseOptions });
    inAnswer.enter('запомни', commands.inAnswerEnter);
    inAnswer.leave('отмена', commands.cancel);
    inAnswer.any(commands.inAnswerProcess);
    alice.registerScene(inAnswer);

    utils.verbs.forEach(verb => {
      alice.command('${question} ' + verb + ' ${answer}', commands.remember);
    });

    alice.command(/^команды$/, commands.commands);

    if (process.env.NODE_ENV != 'production') {
      alice.command(/^демо данные$/, commands.demoData);
    }

    alice.command('отмена', commands.cancel);

    alice.command(['пока', 'отбой', 'все', 'всё', 'хватит', 'закройся'], commands.sessionEnd);

    alice.command('удали последнее', commands.deleteLast);
    alice.command('удали ${question}', commands.deleteQuestion);

    alice.command('забудь всё', commands.clearData);

    alice.command(
      ['спс', 'спасибо', 'благодарю'],
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
      ['молодец', 'умница', 'отлично', 'прекрасно', 'круто'],
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
    alice.command('что ты знаешь', commands.known);
    alice.command('что ты помнишь', commands.known);

    // это ломает команду "запомни что на дворе находится трава"
    // alice.command(['что ты умеешь', 'что ты можешь'], commands.help);
    alice.command('что ты умеешь', commandsHelp.help);
    alice.command('что ты можешь', commandsHelp.help);
    alice.command('помощь', commandsHelp.help);
    alice.command('запоминать', commandsHelp.remember);
    alice.command('отвечать что', commandsHelp.whatis);
    alice.command('отвечать где', commandsHelp.whereis);
    alice.command('забывать', commandsHelp.forget);

    alice.any(commandsHelp.help);

    alice.command('приветствие', commandsHelp.welcome);
    alice.welcome(commandsHelp.welcome);
  }

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }
}

module.exports = YandexDialogsWhatis;
