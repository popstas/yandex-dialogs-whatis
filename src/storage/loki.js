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

  async getUserData(ctx) {
    // TODO: break when super validation failed
    super.getUserData(ctx);

    if (!this.db) {
      try {
        this.db = await this.connect();
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const sharedCollectionName = 'shared';
      let userId = ctx.userId;

      // shared database
      let shared = this.db.getCollection(sharedCollectionName);
      if (shared === null) {
        shared = this.db.addCollection(sharedCollectionName);
      }

      // foreign userId
      const s = shared.data;
      let auth = {};
      if (s.length > 0) auth = s[0].auth;
      if (auth && auth[ctx.userId]) userId = auth[ctx.userId];

      const dataCollectionName = userId + '_data';
      const stateCollectionName = userId + '_state';
      let data = this.db.getCollection(dataCollectionName);
      if (data === null) {
        data = this.db.addCollection(dataCollectionName);
      }
      let state = this.db.getCollection(stateCollectionName);
      if (state === null) {
        state = this.db.addCollection(stateCollectionName);
      }
      return { data, state, shared };
    } catch (err) {
      console.error(err);
    }
  }

  getData(userData) {
    return userData.data.data;
  }

  getState(userData) {
    return userData.state.data[0] || {};
  }

  getShared(userData) {
    return userData.shared.data[0] || {};
  }

  setState(userData, state) {
    /* const found = userData.state.data['state'];
    if (found) {
      found = state;
      userData.state.update(found);
    } else {
      userData.state.insert({ state });
    } */
    // userData.state.clear();
    if (userData.state.data.length == 0) {
      userData.state.insert(state);
    } else {
      userData.state.update(state);
    }
  }

  setShared(userData, shared) {
    if (userData.shared.data.length == 0) {
      userData.shared.insert(shared);
    } else {
      userData.shared.update(shared);
    }
  }

  clearData(userData) {
    if (userData.data.data.length == 0) return;
    userData.data.clear();
  }

  clearState(userData) {
    userData.state.clear();
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

  async removeQuestion(userData, question) {
    const found = userData.data.data.find(item => item.questions.indexOf(question) != -1);
    if (found) {
      userData.data.remove(found);
      return true;
    }
    return false;
  }
}

module.exports = LokiDriver;
