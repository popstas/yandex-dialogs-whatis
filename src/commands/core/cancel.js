// отмена всех текущих процессов сцен
const utils = require('../../utils');

module.exports = {
  intent: 'cancel',
  matcher: /^(отмена|стоп)/i,

  async handler(ctx) {
    ctx.chatbase.setNotHandled();

    ctx.leave();
    ctx = await utils.resetState(ctx);
    return ctx.reply('Всё отменено');
  }
};
