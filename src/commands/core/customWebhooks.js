// кастомные вебхуки
const axios = require('axios');
const matchers = require('../../matchers');

const placeholderRegex = /\{\{[a-zA-Z0-9_-]+\}\}/;
const values = {};

// умеет отрабатывать строки типа "скачай фильм {{q}}"
const getWebhook = ctx => {
  let matched = false;
  let found = ctx.user.state.webhooks.find(webhook => {
    webhook.regs = webhook.strings.map(string => {
      string = string.replace(placeholderRegex, '(.*)?');
      const reg = new RegExp(string);
      return reg;
    });

    const matchReg = webhook.regs.find(reg => {
      return reg.test(ctx.message);
    });

    if (matchReg) matched = matchReg.exec(ctx.message);
    return matchReg;
  });

  if (found) {
    found.matched = matched;
  }

  return found;
};

module.exports = {
  intent: 'customWebhooks',
  matcher(ctx) {
    ctx.user.state.webhooks = ctx.user.state.webhooks || [];
    /* {
        strings: ['тестовый вебхук'],
        url: 'https://yandex.ru'
      } */
    return getWebhook(ctx) ? 0.9 : 0;
  },

  async handler(ctx) {
    ctx.logMessage(`> ${ctx.message} (customWebhooks)`);
    const webhook = getWebhook(ctx);

    // if (webhook.url.match(placeholderRegex)) {
    values.q = webhook.matched[1]; // TODO: всегда передается q, хотя могут быть другие имена
    // webhook.url = webhook.url.replace(placeholderRegex, );
    // }
    const answer = axios.get(webhook.url, { params: values });
    return ctx.reply(webhook.answer || 'Готово');
  }
};
