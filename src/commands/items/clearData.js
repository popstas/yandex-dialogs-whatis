const storage = require('../../storage');
const utils = require('../../utils');

module.exports = {
  matcher: ['забудь всё', 'забудь все', 'удали все', 'забыть все', 'сотри все', 'стереть все'],

  async handler(ctx) {
    ctx.chatbase.setIntent('clearDataConfirm');
    ctx.logMessage(`> ${ctx.message} (clearData confirm)`);

    return ctx.confirm('Точно?', clearData, ctx => ctx.reply('Как хочешь'));
  }
};

const clearData = async ctx => {
  ctx.chatbase.setIntent('clearData');
  ctx.logMessage(`> ${ctx.message} (clearData)`);

  await storage.clearData(ctx.userData);
  ctx = await utils.resetState(ctx);
  return ctx.reply('Всё забыла...');
};
