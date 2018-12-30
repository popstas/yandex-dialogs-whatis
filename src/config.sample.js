'use strict';

module.exports = {
  DB_DRIVER: process.env.DB_DRIVER || 'loki',
  DB_HOST: process.env.DB_HOST || 'mongo',
  DB_PORT: process.env.DB_PORT || '27017',
  DB_NAME: process.env.DB_NAME || 'yandex-dialogs-whatis',
  DB_USER: process.env.DB_USER || 'yandex-dialogs-whatis',
  DB_PASSWORD: process.env.DB_PASSWORD || 'mypassword',
  API_ENDPOINT: process.env.API_ENDPOINT || '/'
};
