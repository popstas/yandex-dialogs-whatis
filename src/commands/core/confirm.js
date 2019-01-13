const matchers = require('../../matchers');

module.exports = {
  intent: '',
  matcher(ctx){
    return !!ctx.session.get('confirm')
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
    if (ctx.message.match(/^повтори/)) {
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
