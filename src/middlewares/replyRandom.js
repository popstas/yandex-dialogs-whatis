// зависит от reply
module.exports = () => (ctx, next) => {
  ctx.replyRandom = (messages, buttons) => {
    const randomKey = Math.floor(Math.random() * messages.length);
    const lines = messages[randomKey];

    return ctx.reply(lines, buttons);
  };
  return next(ctx);
};
