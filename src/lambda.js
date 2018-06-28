'use strict';

const app = require('./app');
const bot = new app();

module.exports = bot.handlerExpress();
