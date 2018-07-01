'use strict'
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

class Scenarios {
  constructor(ymlPath, url) {
    this.scenarios = [];
    this.isErrors = false;
    this.load(ymlPath, url);
  }

  load(ymlPath, url) {
    const doc = yaml.safeLoad(fs.readFileSync(ymlPath, 'utf-8'));
    for (let name in doc) {
      if (doc.hasOwnProperty(name)) {
        this.scenarios.push(new Scenario(name, doc[name], url));
      }
    }
  }

  async run() {
    this.scenarios.map(async scenario => {
      let isErrors = await scenario.run();
      if (isErrors) {
        this.isErrors = true;
        console.log(errors.join('\n'));
      }
    });
    return this.isErrors;
  }
}

// data - список реплик
class Scenario {
  constructor(name, data, url) {
    this.name = name;
    this.data = data;
    this.url = url;
    this.isErrors = false;

    this.messageId = 1;
    this.sessionNew = true;
    this.sessionId = 1;
    this.userId = 1;
  }

  async run() {
    console.log('run scenario: ', this.name);
    this.isUser = true;
    this.data.map(async item => {
      let lastAnswer = false;

      // check
      if (!this.isUser) {
        if (typeof item === 'string') {
          console.log(`test ${lastAnswer.text} == ${item}`);
          if (lastAnswer.text != item) {
            this.isErrors = true;
            console.log(`отвечено: ${lastAnswer.text}\nожидалось: ${item}`);
            return this.isErrors;
          }
        }
        if (typeof item === 'object') {
          if (!item.tests) {
            this.isErrors = true;
            console.error('В yml должны быть tests');
            return this.isErrors;
          }
          let failed = [];

          item.tests.map(testItem => {
            let testType = Object.keys(testItem)[0];
            let testVal = testItem[testType];
            console.log(`test ${testType} ${testVal}`);
            // contains
            if (testType == 'contains' && !lastAnswer.text.includes(testVal)) {
              failed.push(`ответ не содержит "${testVal}"`);
              return this.isErrors;
            }

            // not contains
            if (testType == 'not_contains' && lastAnswer.text.includes(testVal)) {
              failed.push(`ответ содержит "${testVal}", но не должен`);
              return this.isErrors;
            }
          });

          if (failed.length > 0) {
            this.isErrors = true;
            console.log(failed.join('\n'));
            return this.isErrors;
          }
        }

        // send
      } else {
        console.log('send: ', item);
        let lastAnswer = await this.aliceRequest(item);
        console.log('answer: ', lastAnswer);
      }
      console.log('change user');
      this.isUser = !this.isUser;
    });
    return this.isErrors;
  }

  async aliceRequest(command) {
    const offset = new Date().getTimezoneOffset() / 60;
    const timezone = 'GMT' + (offset < 0 ? '+' : '-') + Math.abs(offset);
    const userAgent = 'popstas/testbot';

    const data = {
      meta: {
        locale: 'ru-RU',
        timezone: timezone,
        client_id: userAgent
      },
      request: {
        type: 'SimpleUtterance',
        payload: {},
        command: command
      },
      session: {
        message_id: this.messageId,
        new: this.sessionNew,
        session_id: this.sessionId,
        user_id: this.userId
      },
      version: '1.0'
    };

    let answer = await axios.post(this.url, data);
    console.log(answer);

    this.messageId++;
    this.sessionNew = false;

    return answer;
  }
}

module.exports = { Scenarios, Scenario };
