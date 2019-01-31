// сколько человек было сегодня
const yaml = require('js-yaml');
const fs = require('fs');

const pad = d => (d > 9 ? d : '0' + d);
Date.prototype.outDate = function() {
  return [this.getFullYear(), pad(this.getDate()), pad(this.getMonth() + 1)].join('-');
};

module.exports = {
  intent: 'visits',
  matcher: /(сколько (человек |было )*(сегодня|вчера)|посещаемость)/i,

  async handler(ctx) {
    const stat = ctx.user.shared.stat || {};
    const today = stat.visits[new Date().outDate()] || 0;
    const yesterday = stat.visits[new Date(new Date().getTime() - 86400000).outDate()] || 0;

    const s = {
      today: ctx.az.pluralWord('визит', today),
      yesterday: ctx.az.pluralWord('визит', yesterday)
    };

    return await ctx.reply([`Сегодня ${s.today}.`, `Вчера ${s.yesterday}.`]);
  }
};
