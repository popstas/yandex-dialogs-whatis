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

  getUserData(ctx) {
    // TODO: break when super validation failed
    super.getUserData(ctx, callback);

    try {
      const dataCollectionName = ctx.userId + '_data';
      const stateCollectionName = ctx.userId + '_state';
      let data = this.db.getCollection(dataCollectionName);
      if (data === null) {
        data = this.db.addCollection(dataCollectionName);
      }
      let state = this.db.getCollection(stateCollectionName);
      if (state === null) {
        state = this.db.addCollection(stateCollectionName);
      }
      return { data, state };
    } catch (err) {
      ctx.reply('Ошибка при получении данных пользователя, попробуйте позже');
      return false;
    }
  }

  getData(userData) {
    return userData.data.data;
  }

  getState(userData) {
    return userData.state.data;
  }

  setState(userData, name, value){
    const found = userData.state.data[name];
    if (found) {
      found.value = value;
      userData.state.update(found);
    } else {
      userData.state.insert({ name, value });
    }
  }

  clearData(userData) {
    userData.data.clear();
  }

  fillDemoData(userData) {
    userData.data.clear();
    userData.data.insert(demoData);
  }

  storeAnswer(userData, question, answer) {
    const found = userData.data.data.find(item => item.questions.indexOf(question) != -1);
    if (found) {
      found.answer = answer;
      userData.data.update(found);
    } else {
      userData.data.insert({
        questions: [question],
        answer: answer
      });
    }
  }
}

module.exports = LokiDriver;
