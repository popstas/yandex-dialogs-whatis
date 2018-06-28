'use strict';

const BaseDriver = require('./base');
const loki = require('lokijs');
const demoData = require('../demoData');

class LokiDriver extends BaseDriver {
  constructor(path){
    super();
    this.path = path;
  }

  connect(){
    return new Promise((resolv, reject) => {
      this.db = new loki(this.path, {
        autoload: true,
        autoloadCallback: () => resolv(this.db),
        autosave: true,
        autosaveInterval: 4000
      });
    });
  }

  getUserData(ctx, callback){
    let userId = ctx.userId;
    if (!userId) {
      return ctx.reply('Не указан идентификатор пользователя');
    }

    let userData = this.db.getCollection(userId);
    if (userData === null) {
      userData = this.db.addCollection(userId);
    }
    return callback(ctx, userData);
  }

  fillDemoData(userData){
    userData.clear();
    userData.insert(demoData);
  }

  storeAnswer(userData, question, answer) {
    const found = userData.data.find(item => item.questions.indexOf(question) != -1);
    if (found) {
      found.answer = answer;
      userData.update(found);
    } else {
      userData.insert({
        questions: [question],
        answer: answer
      });
    }
  }
}

module.exports = LokiDriver;
