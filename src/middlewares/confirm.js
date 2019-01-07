// спрашивает подтверждение
module.exports = () => (ctx, next) => {
  ctx.confirm = (reply, yesCommand, noCommand, options) => {
    ctx.session.set('confirm', { yesCommand, noCommand, options, reply });
    return ctx.replySimple(reply, ['да', 'нет']);
  };
  return next(ctx);
};
