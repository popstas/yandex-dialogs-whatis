const { Reply, Markup } = require('yandex-dialogs-sdk');
const storage = require('../storage');

const onShutdown = async (ctx, text) => {
  // send yandex metrika
  text = text.substring(0, 100);
  let url = `d://${ctx.message}/${text}`;
  ctx.yametrika.onShutdown(url);
  ctx.user.state.referer = url;

  ctx.chatbase.sendEvent(text);

  // store state
  await storage.setState(ctx.userData, ctx.user.state);
};

module.exports = () => (ctx, next) => {
  ctx.replySimple = async (lines, buttons) => {
    let text = '';
    let resultButtons = [];

    if (typeof lines === 'string') text = lines;
    else if (Array.isArray(lines)) text = lines.join('\n');

    if (Array.isArray(buttons)) {
      resultButtons = buttons.map(button => Markup.button(button));
    }

    await onShutdown(ctx, text);

    // log outgoing message
    if (ctx.message != 'ping') ctx.logMessage(`< ${text.split('\n').join(' [n] ')}`);

    return Reply.text(text, { buttons: resultButtons });
  };

  ctx.reply = (lines, buttons) => ctx.replySimple(lines, buttons);

  return next(ctx);
};
