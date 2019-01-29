const storage = require('../../storage');
const utils = require('../../utils');

module.exports = {
  intent: 'clearDataConfirm',
  matcher: ['забудь всё', 'забудь все', 'удали все', 'забыть все', 'сотри все', 'стереть все'],

  async handler(ctx) {
    return ctx.confirm(
      'Точно?',
      async ctx => {
        ctx.chatbase.setIntent('clearData');
        ctx.logMessage(`> ${ctx.message} (clearData)`);

        await storage.clearData(ctx.userData);
        ctx.user.state.products = [];
        ctx = await utils.resetState(ctx);
        return ctx.reply('Всё забыла...');
      },
      ctx => ctx.reply('Как хочешь')
    );
  }
};
