const storage = require('../../storage');

// команда "демо данные"
module.exports = {
  intent: 'demoDataConfirm',
  matcher: 'демо данные',

  handler(ctx) {
    return ctx.confirm('Точно?', demoData, ctx => ctx.reply('Как хочешь'));
  }
};

const demoData = async ctx => {
  ctx.chatbase.setIntent('demoData');
  ctx.logMessage(`> ${ctx.message} (demoData)`);

  await storage.fillDemoData(ctx.userData);
  ctx = await resetState(ctx);
  return ctx.reply('Данные сброшены на демонстрационные');
};