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
        const sharedCollectionName = 'shared';
        let userId = ctx.userId;

        // shared database
        let shared = await this.db.collection(sharedCollectionName);
        if (shared === null) {
          shared = await this.db.createCollection(sharedCollectionName);
        }

        // foreign userId
        const s = await shared.find({ name: 'shared' }).toArray();
        let auth = {};
        if (s.length > 0) auth = s[0].shared.auth;
        if (auth && auth[ctx.userId]) userId = auth[ctx.userId];

        const dataCollectionName = userId + '_data';
        const stateCollectionName = userId + '_state';
        let data = await this.db.collection(dataCollectionName);
        if (data === null) {
          data = await this.db.createCollection(dataCollectionName);
        }
        let state = await this.db.collection(stateCollectionName);
        if (state === null) {
          state = await this.db.createCollection(stateCollectionName);
        }
        resolve({ data, state, shared });
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

  async getShared(userData) {
    let shared = await userData.shared.find({ name: 'shared' }).toArray();
    let result = shared.length > 0 ? shared[0].shared : {};
    if (Array.isArray(result)) result = {};
    return result;
  }

  async setState(userData, state) {
    const result = await userData.state.updateOne(
      { name: 'state' },
      { $set: { state } },
      { upsert: true }
    );
  }

  async setShared(userData, shared) {
    const result = await userData.shared.updateOne(
      { name: 'shared' },
      { $set: { shared } },
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
