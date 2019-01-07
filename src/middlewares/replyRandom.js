// зависит от replySimple
module.exports = () => (ctx, next) => {
  ctx.replyRandom = (messages, buttons) => {
    const replyMessage = ctx.replyBuilder;

    const randomKey = Math.floor(Math.random() * messages.length);
    const lines = messages[randomKey];

    return ctx.replySimple(lines, buttons);
  };
  return next(ctx);
};
