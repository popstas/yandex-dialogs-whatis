const strings = require('./strings');

module.exports = () => ctx =>
  ctx.message.match(/^(пока |пока$|спасибо пока|отбой$|выключи|отбой|всё$|хватит|закрой)/i);
