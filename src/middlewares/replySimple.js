const { Reply, Markup } = require('yandex-dialogs-sdk');

module.exports = () => (ctx, next) => {
  ctx.replySimple = (lines, buttons) => {
    let text = '';
    let resultButtons = [];

    if (typeof lines === 'string') text = lines;
    else if (Array.isArray(lines)) text = lines.join('\n');

    if (Array.isArray(buttons)) {
      resultButtons = buttons.map(button => Markup.button(button));
    }

    ctx.logMessage(`< ${text.split('\n').join(' [n] ')}`);
    return Reply.text(text, { buttons: resultButtons });
  };

  ctx.reply = (lines, buttons) => ctx.replySimple(lines, buttons);

  return next(ctx);
};
