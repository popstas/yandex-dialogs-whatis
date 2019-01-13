const storage = require('../../storage');
const utils = require('../../utils');

module.exports = {
  intent: 'clearDataConfirm',
  matcher: ['забудь всё', 'забудь все', 'удали все', 'забыть все', 'сотри все', 'стереть все'],

  async handler(ctx) {
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
