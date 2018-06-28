'use strict';

const LokiDriver = require('./storage/loki');
const MongoDriver = require('./storage/mongo');
const config = require('../config');

const DB_PATH = 'data/loki.db';

const DB_HOST = config.DB_HOST;
const DB_PORT = config.DB_PORT;
const DB_NAME = config.DB_NAME;
const DB_USER = config.DB_USER;
const DB_PASSWORD = config.DB_PASSWORD;

let storage;

if (process.env.DB_DRIVER === 'mongo') {
  const dbUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  storage = new MongoDriver(dbUrl, DB_NAME, DB_USER, DB_PASSWORD);
} else {
  storage = new LokiDriver(DB_PATH);
}

module.exports = storage;
