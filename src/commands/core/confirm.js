// при наличии session.confirm запускаем сценарий подтверждения
const matchers = require('../../matchers');

const anycommand = ctx => {
  const confirm = ctx.session.get('confirm');
  return ctx.replyRandom(
    [
      'Скажите "да" или "нет"',
      'Не отстану, пока не получу ответ',
      'А ответ-то какой?',
      confirm.reply
    ],
    ['да', 'нет']
  );
};

module.exports = {
  intent: '',
  matcher(ctx) {
    const confirm = ctx.session.get('confirm');
    if (!confirm) return 0;
    if (!confirm.options || !confirm.options.optional) return 1;
    return 0.01; // если optional, то команда сработает только если не нашлось других команд
  },

  async handler(ctx) {
    ctx.logMessage(`> ${ctx.message} (confirm)`);
    const confirm = ctx.session.get('confirm');
    let cmd;
    const options = {
      ...confirm.options,
      ...{
        yesMatcher: matchers.yes(),
        noMatcher: matchers.no(),
        anyCommand: anycommand,
        optional: false
      }
    };
    if (ctx.message.match(/^повтори/i)) {
      ctx.chatbase.setIntent('confirmRepeat');
      return ctx.reply(confirm.reply, ['да', 'нет']);
    } else if (options.yesMatcher(ctx)) {
      cmd = confirm.yesCommand;
    } else if (options.noMatcher(ctx)) {
      cmd = confirm.noCommand;
    }

    if (cmd) {
      ctx.session.set('confirm', null);
      return await cmd(ctx);
    }

    return options.anyCommand(ctx);
  }
};
