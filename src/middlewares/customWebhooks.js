const matchers = require('../matchers');

// спрашивает подтверждение
/* const handler = async (ctx, confirm) => {
  ctx.logMessage(`> ${ctx.message} (confirm)`);
  let cmd;
  const options = {
    ...confirm.options,
    ...{
      yesMatcher: matchers.yes(),
      noMatcher: matchers.no(),
      anyCommand: ctx =>
        ctx.replyRandom(
          [
            'Скажите "да" или "нет"',
            'Не отстану, пока не получу ответ',
            'А ответ-то какой?',
            confirm.reply
          ],
          ['да', 'нет']
        )
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
}; */

module.exports = () => (ctx, next) => {
  // сбросить подтверждение, если человек вышел-зашел
  if (ctx.message == '') {
    ctx.session.set('confirm', null);
  }

  // options: { anyCommand: function, optional: false }
  ctx.confirm = async (reply, yesCommand, noCommand, options) => {
    ctx.session.set('confirm', { yesCommand, noCommand, options, reply });
    return await ctx.reply(reply, ['да', 'нет']);
  };

  /* ctx.confirmHandler()

  const confirm = ctx.session.get('confirm');
  if (confirm) return handler(ctx, confirm); */

  return next(ctx);
};
