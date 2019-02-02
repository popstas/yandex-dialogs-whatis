// кастомные вебхуки
const axios = require('axios');
const matchers = require('../../matchers');

const getWebhook = ctx => {
  return ctx.user.state.webhooks.find(webhook => {
    webhook.regs = webhook.strings.map(string => {
      const reg = new RegExp(string);
      return reg;
    });

    const match = webhook.regs.find(reg => {
      return reg.test(ctx.message);
    });

    return match;
  });
};

module.exports = {
  intent: 'customWebhooks',
  matcher(ctx) {
    ctx.user.state.webhooks = ctx.user.state.webhooks || [];
    /* {
        strings: ['тестовый вебхук'],
        url: 'https://yandex.ru'
      } */
    return getWebhook(ctx) ? 1 : 0;
  },

  async handler(ctx) {
    ctx.logMessage(`> ${ctx.message} (customWebhooks)`);
    const webhook = getWebhook(ctx);
    const answer = axios.get(webhook.url);
    return ctx.reply(webhook.answer || 'Готово');
  }
};
