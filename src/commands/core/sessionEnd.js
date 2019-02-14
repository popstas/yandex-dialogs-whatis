// пока
const utils = require('../../utils');

module.exports = {
  intent: 'sessionEnd',
  matcher: /^(пока |пока$|выйти|выход|(спасибо|все|ладно) (пока|до свидания)|отбой$|выключи|отбой|всё$|хватит|закрой|закрыть|заканчиваем|закончить|спокойной ночи|домой$)/i,

  async handler(ctx) {
    ctx = await utils.resetState(ctx);
    return ctx.reply('До свидания!', [], { end_session: true });
  }
};
