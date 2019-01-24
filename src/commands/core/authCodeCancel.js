// отмена связывания
const storage = require('../../storage');

module.exports = {
  intent: 'authCodeCancel',
  matcher: ['отменить авторизацию', 'отвязать устройство', 'отмени авторизацию'],

  async handler(ctx) {
    if (!ctx.user.shared.auth[ctx.userId]) {
      return ctx.reply('Вы не привязаны ни к каким устройствам');
    }

    // привязка к самому себе
    ctx.user.shared.auth[ctx.userId] = ctx.userId;
    await storage.setShared(ctx.userData, ctx.user.shared);

    return ctx.reply(
      ['Устройство отвязано, теперь к нему вернулась прежняя память.'],
      ['что ты знаешь', 'скажи код']
    );
  }
};
