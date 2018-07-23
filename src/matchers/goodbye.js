const strings = require('./strings');

module.exports = () => ctx =>
  ctx.message.match(/^(пока|спасибо пока|отбой|выключи|отбой|все|всё|хватит|закрой)/i);
