'use strict';

class BaseDriver {
  constructor() {
    this.db = null;
  }

  connect() {}

  getUserData(ctx) {
    let userId = ctx.userId;
    if (!userId) {
      return ctx.reply('Не указан идентификатор пользователя');
    }
  }

  getData(userData) {}

  getState(userData) {}

  clearData(userData) {}

  fillDemoData(userData) {}

  storeAnswer(userData, question, answer) {}
}

module.exports = BaseDriver;
