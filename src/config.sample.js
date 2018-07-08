'use strict';

module.exports = {
  DB_DRIVER: process.env.DB_DRIVER || 'loki',
  DB_HOST: process.env.DB_HOST || '',
  DB_PORT: process.env.DB_PORT || '',
  DB_NAME: process.env.DB_NAME || '',
  DB_USER: process.env.DB_USER || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  API_ENDPOINT: process.env.API_ENDPOINT || '/'
};
