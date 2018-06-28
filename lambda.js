'use strict'
const app = require('./src/app');
const bot = new app();

exports.handler = bot.handleRequestBody;
