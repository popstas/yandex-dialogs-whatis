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
      },
      (err, client) => {
        assert.equal(null, err);
        console.log('Connected correctly to server');

        this.db = client.db(this.name);
      }
    );
  }

  async getUserData(ctx, callback) {
    super.getUserData(ctx, callback);

    let userData = await this.db.collection(ctx.userId);
    if (userData === null) {
      userData = await this.db.createCollection(ctx.userId);
    }
    return callback(ctx, userData);
  }

  async getData(userData) {
    return await userData.find({}).toArray();
  }

  async fillDemoData(userData) {
    await userData.remove({});
    await userData.insert(demoData);
  }

  async storeAnswer(userData, question, answer) {
    const found = await userData.update(
      { questions: question },
      { $set: {answer} },
      { upsert: true }
    );
  }
}

module.exports = MongoDriver;
