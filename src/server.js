'use strict';

const app = require('./app');

const PORT = process.env.BASE_URL || 3002;

const bot = new app();
bot.listen(PORT);
