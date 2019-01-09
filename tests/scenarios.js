'use strict';
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

class Scenarios {
  constructor(ymlPath, url) {
    this.scenarios = [];
    this.isErrors = false;
    this.failed = [];
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
    this.failed = [];
    for (let i in this.scenarios) {
      const scenario = this.scenarios[i];
      const isErrors = await scenario.run();
      if (isErrors) {
        this.isErrors = true;
        this.failed.push(scenario);
      }
    }
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
    this.isUser = true;
    this.lastAnswer = '';

    this.messageId = 1;
    this.sessionNew = false;
    this.sessionId = '1234567890ABCDEF';
    this.userId = '123ABC456';

    this.versose = false;
    this.timeout = 200000;
  }

  // return isSuccess
  checkAnswer(answer, item) {
    if (typeof item === 'string') {
      if (this.versose) console.log(`test ${answer} == ${item}`);
      if (answer != item) {
        console.error(`отвечено: ${answer}\nожидалось: ${item}`);
        return false;
      }
    }
    if (typeof item === 'object') {
      if (!item.tests) {
        console.error('В yml должны быть tests');
        return false;
      }
      let failed = [];

      item.tests.map(testItem => {
        let testType = Object.keys(testItem)[0];
        let testVal = testItem[testType];
        if (this.versose) console.log(`test ${testType} ${testVal}`);
        // contains
        if (testType == 'contains' && !answer.includes(testVal)) {
          failed.push(`ответ не содержит "${testVal}"`);
          return false;
        }

        // not contains
        if (testType == 'not_contains' && answer.includes(testVal)) {
          failed.push(`ответ содержит "${testVal}", но не должен`);
          return false;
        }
      });

      if (failed.length > 0) {
        console.error(failed.join('\n'));
        return false;
      }
    }
    return true;
  }

  // начало диалога
  async run() {
    console.log('### scenario: ', this.name);
    this.isUser = true;
    this.lastAnswer = '';

    for (let i in this.data) {
      // item - реплика
      const item = this.data[i];

      // check
      if (!this.isUser) {
        const result = this.checkAnswer(this.lastAnswer.response.text, item);
        // при ошибке диалог заканчивается
        if (!result) {
          this.isErrors = true;
          break;
        }
        // send
      } else {
        console.log('> ' + item);
        try {
          this.lastAnswer = await this.aliceRequest(item);
          if (this.lastAnswer.response.end_session) {
            this.sessionNew = true;
          }
          console.log('< ' + this.lastAnswer.response.text);
        } catch (err) {
          console.error(err);
        }
      }
      this.isUser = !this.isUser;
    }

    console.log('\n\n\n');
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
        original_utterance: command,
        command: command,
        payload: {}
      },
      session: {
        new: this.sessionNew,
        message_id: this.messageId,
        session_id: this.sessionId,
        user_id: this.userId
      },
      version: '1.0'
    };

    try {
      const ajax = axios.create({
        baseURL: this.url,
        timeout: this.timeout
      });
      const answer = await ajax.post('/', data);

      this.messageId++;
      this.sessionNew = false;

      return answer.data;
    } catch (err) {
      console.error('error: ', err);
    }
  }
}

module.exports = { Scenarios, Scenario };
