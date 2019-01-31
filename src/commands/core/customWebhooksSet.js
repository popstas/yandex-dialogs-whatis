// задать кастомные вебхуки через json
const matchers = require('../../matchers');

module.exports = {
  intent: 'customWebhooksSet',
  matcher(ctx) {
    return ctx.originalUtterance.match(/^\{/) ? 1 : 0;
  },

  async handler(ctx) {
    ctx.logMessage(`> ${ctx.originalUtterance} (customWebhooksSet)`);

    try {
      let webhook = JSON.parse(ctx.originalUtterance);
      if (!webhook) throw 'parse error';
      let webhooks = ctx.user.state.webhooks || [];

      foundIndex = webhooks.findIndex(h => h.name == webhook.name);
      if (foundIndex != -1) webhooks[foundIndex] = webhook;
      else webhooks.push(webhook);

      webhooks = webhooks.filter(webhook => webhook.name && webhook.url && webhook.strings);
      if (webhooks.length == 0) throw 'empty list';

      ctx.user.state.webhooks = webhooks;
      return await ctx.reply('Поставила новые вебхуки');
    } catch (err) {
      console.log(err);
      return ctx.reply('Пыталась поставить новые вебхуки, но не вышло');
    }
  }
};
