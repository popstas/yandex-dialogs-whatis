const utils = require('../../utils');

module.exports = {
  matcher: /^(пока |пока$|выйти|выход|спасибо пока|отбой$|выключи|отбой|всё$|хватит|закрой|закрыть|заканчиваем|закончить|спокойной ночи)/i,

  async handler(ctx) {
    ctx.chatbase.setIntent('sessionEnd');
    ctx.logMessage(`> ${ctx.message} (sessionEnd)`);
  
    ctx = await utils.resetState(ctx);
    return ctx.reply('До свидания!', [], { end_session: true });
    }
};
