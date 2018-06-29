'use strict';

const BaseDriver = require('./base');
const loki = require('lokijs');
const demoData = require('../demoData');

class LokiDriver extends BaseDriver {
  constructor(path) {
    super();
    this.path = path;
  }

  connect() {
    return new Promise((resolv, reject) => {
      this.db = new loki(this.path, {
        autoload: true,
        autoloadCallback: () => resolv(this.db),
        autosave: true,
        autosaveInterval: 4000
      });
    });
  }

  getUserData(ctx, callback) {
    // TODO: break when super validation failed
    super.getUserData(ctx, callback);

    let userData = this.db.getCollection(ctx.userId);
    if (userData === null) {
      userData = this.db.addCollection(ctx.userId);
    }
    return callback(ctx, userData);
  }

  getData(userData) {
    return userData.data;
  }

  clearData(userData) {
    userData.clear();
  }

  fillDemoData(userData) {
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
