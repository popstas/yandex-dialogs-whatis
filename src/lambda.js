'use strict'

const app = require('./app');
const bot = new app();
const express = bot.createApp('/yandex-dialogs-whatis'); // must match to AWS API Gateway endpoint

// test routes
express.get('/', (req, res) => res.send('GET /'));
express.get('/yandex-dialogs-whatis', (req, res) => res.send('GET /yandex-dialogs-whatis'));

module.exports = express;
