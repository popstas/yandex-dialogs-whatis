'use strict';

class BaseDriver {
  constructor() {
    this.db = {};
  }

  connect() {}

  getUserData(ctx, callback) {}

  fillDemoData(userData) {}

  storeAnswer(userData, question, answer) {}
}

module.exports = BaseDriver;
