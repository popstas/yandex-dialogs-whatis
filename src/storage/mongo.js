'use strict';

const BaseDriver = require('./base');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const demoData = require('../demoData');

class MongoDriver extends BaseDriver {
  constructor(url, name, user, password) {
    super();
    this.url = url;
    this.name = name;
    this.user = user;
    this.password = password;
  }

  connect() {
    return MongoClient.connect(
      this.url,
      {
        useNewUrlParser: true,
        auth: {
          user: this.user,
          password: this.password
        }
      }
    );
  }

  getUserData(ctx) {
    super.getUserData(ctx);

    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        try {
          const client = await this.connect();
          this.db = client.db(this.name);
          console.log('mongo connected');
        } catch (err) {
          reject(err);
          return ctx.reply('Ошибка при подключении к базе данных, попробуйте позже');
        }
      }

      try {
        let userData = await this.db.collection(ctx.userId);
        if (userData === null) {
          userData = await this.db.createCollection(ctx.userId);
        }
        resolve(userData);
      } catch (err) {
        reject(err);
        return ctx.reply('Ошибка при получении данных пользователя, попробуйте позже');
      }
    });
  }

  async getData(userData) {
    return await userData.find({}).toArray();
  }

  async clearData(userData) {
    await userData.remove({});
  }

  async fillDemoData(userData) {
    await this.clearData(userData);
    await userData.insert(demoData);
  }

  async storeAnswer(userData, question, answer) {
    const result = await userData.update(
      { questions: question },
      { $set: { answer }, $setOnInsert: { questions: [question] } },
      { upsert: true }
    );
  }
}

module.exports = MongoDriver;
