const strings = require('./strings');

module.exports = () => ctx =>
  !!ctx.message.match(/^(пока |пока$|выйти|выход|спасибо пока|отбой$|выключи|отбой|всё$|хватит|закрой|закрыть|заканчиваем|закончить)/i);
