const { Reply, Markup } = require('yandex-dialogs-sdk');
const storage = require('../storage');

module.exports = () => (ctx, next) => {
  ctx.replySimple = async (lines, buttons) => {
    let text = '';
    let resultButtons = [];

    if (typeof lines === 'string') text = lines;
    else if (Array.isArray(lines)) text = lines.join('\n');

    if (Array.isArray(buttons)) {
      resultButtons = buttons.map(button => Markup.button(button));
    }

    // store state
    await storage.setState(ctx.userData, ctx.user.state);

    // log outgoing message
    if (ctx.message != 'ping') ctx.logMessage(`< ${text.split('\n').join(' [n] ')}`);

    return Reply.text(text, { buttons: resultButtons });
  };

  ctx.reply = (lines, buttons) => ctx.replySimple(lines, buttons);

  return next(ctx);
};
