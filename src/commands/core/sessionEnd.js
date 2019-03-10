// пока
const utils = require('../../utils');

module.exports = {
  intent: 'sessionEnd',
  matcher: /^(спасибо |все |ладно )?(пока |пока$|выйти|выход|до свидания|отбой$|выключи|отключись|отключайся|отбой|всё$|хватит|закрой|закрыть|заканчиваем|закончить|спокойной ночи|домой$)/i,

  async handler(ctx) {
    ctx = await utils.resetState(ctx);
    return ctx.reply('До свидания!', [], { end_session: true });
  }
};
