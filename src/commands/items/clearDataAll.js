const storage = require('../../storage');
const utils = require('../../utils');

module.exports = {
  intent: 'clearDataAllConfirm',
  matcher: 'забудь все вообще',

  async handler(ctx) {
    return ctx.confirm('Точно?', clearDataAll, ctx => ctx.reply('Как хочешь'));
  }
};

const clearDataAll = async ctx => {
  ctx.chatbase.setIntent('clearDataAll');
  ctx.logMessage(`> ${ctx.message} (clearDataAll)`);

  await storage.clearData(ctx.userData);
  [
    'answer',
    'deleteFails',
    'lastAddedItem',
    'lastRequest',
    'lastWelcome',
    'products',
    'question',
    'referer',
    'stage',
    'tourStep',
    'visit',
    'visitor',
    'webhooks'
  ].forEach(name => {
    delete ctx.user.state[name];
  });
  /* ctx.user.state.products = [];
  delete(ctx.user.state.visitor);
  delete(ctx.user.state.visit);
  ctx.user.state.tourStep = '';
  ctx.user.state.webhooks = []; */
  ctx = await utils.resetState(ctx);
  return ctx.reply('Вообще всё забыла...');
};
