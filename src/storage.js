'use strict';

const LokiDriver = require('./storage/loki');

let storage;

storage = new LokiDriver(DB_PATH);

module.exports = storage;
