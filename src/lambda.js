'use strict';

const serverless = require('serverless-http');
const app = require('./app');
const bot = new app();
const exp = bot.handlerExpress();

module.exports.handler = serverless(exp);
