const storage = require('../../storage');
const utils = require('../../utils');

module.exports = {
  matcher: 'забудь все вообще',

  async handler(ctx) {
    ctx.chatbase.setIntent('clearDataAllConfirm');
    ctx.logMessage(`> ${ctx.message} (clearDataAll confirm)`);

    return ctx.confirm('Точно?', clearDataAll, ctx => ctx.reply('Как хочешь'));
  }
};

const clearDataAll = async ctx => {
  ctx.chatbase.setIntent('clearDataAll');
  ctx.logMessage(`> ${ctx.message} (clearDataAll)`);

  await storage.clearData(ctx.userData);
  ctx.user.state.visitor = { visits: 1 };
  ctx.user.state.visit = { messages: 0 };
  ctx.user.state.tourStep = '';
  ctx = await utils.resetState(ctx);
  return ctx.reply('Вообще всё забыла...');
};