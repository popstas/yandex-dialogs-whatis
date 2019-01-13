const utils = require('../../utils');

module.exports = {
  matcher: /^отмена/i,

  async handler(ctx) {
    ctx.chatbase.setIntent('cancel');
    ctx.logMessage(`> ${ctx.message} (cancel)`);
    ctx.chatbase.setNotHandled();

    ctx.leave();
    ctx = await utils.resetState(ctx);
    return ctx.reply('Всё отменено');
  }
};
