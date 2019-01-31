// задать кастомные вебхуки через json
const matchers = require('../../matchers');

module.exports = {
  intent: 'customWebhooksSet',
  matcher(ctx) {
    return ctx.message.match(/^\[/) ? 1 : 0;
  },

  async handler(ctx) {
    ctx.logMessage(`> ${ctx.message} (customWebhooksSet)`);

    try {
      let webhooks = JSON.parse(ctx.message);
      if (!webhooks) throw 'parse error';

      webhooks = webhooks.filter(webhook => webhook.url && webhook.strings);
      if (webhooks.length == 0) throw 'empty list';

      ctx.user.state.webhooks = webhooks;
      return await ctx.reply('Поставила новые вебхуки');
    } catch (err) {
      console.log(err);
      return ctx.reply('Пыталась поставить новые вебхуки, но не вышло');
    }
  }
};
