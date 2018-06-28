'use strict';

class BaseDriver {
  constructor() {
    this.db = {};
  }

  connect() {}

  getUserData(ctx, callback) {
    let userId = ctx.userId;
    if (!userId) {
      return ctx.reply('Не указан идентификатор пользователя');
    }
  }

  getData(userData) {}

  fillDemoData(userData) {}

  storeAnswer(userData, question, answer) {}
}

module.exports = BaseDriver;
