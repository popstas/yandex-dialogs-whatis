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
          // console.log('mongo connected');
        } catch (err) {
          reject(err);
        }
      }

      try {
        const dataCollectionName = ctx.userId + '_data';
        const stateCollectionName = ctx.userId + '_state';
        let data = await this.db.collection(dataCollectionName);
        if (data === null) {
          data = await this.db.createCollection(dataCollectionName);
        }
        let state = await this.db.collection(stateCollectionName);
        if (state === null) {
          state = await this.db.createCollection(stateCollectionName);
        }
        resolve({ data, state });
      } catch (err) {
        reject(err);
      }
    });
  }

  async getData(userData) {
    return await userData.data.find({}).toArray();
  }

  async getState(userData) {
    let state = await userData.state.find({ name: 'state' }).toArray();
    return state.length > 0 ? state[0].state : {};
  }

  async setState(userData, state) {
    const result = await userData.state.updateOne(
      { name: 'state' },
      { $set: { state } },
      { upsert: true }
    );
  }

  async clearData(userData) {
    await userData.data.deleteMany({});
  }

  async clearState(userData) {
    await userData.state.deleteMany({});
  }

  async fillDemoData(userData) {
    await this.clearData(userData);
    await userData.data.insert(demoData);
  }

  async storeAnswer(userData, question, answer) {
    const result = await userData.data.updateOne(
      { questions: question },
      { $set: { answer }, $setOnInsert: { questions: [question] } },
      { upsert: true }
    );
  }

  async removeQuestion(userData, question) {
    const result = await userData.data.deleteOne({ questions: question });
    return result.deletedCount == 1;
  }
}

module.exports = MongoDriver;
