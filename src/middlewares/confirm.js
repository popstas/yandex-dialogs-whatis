// спрашивает подтверждение
module.exports = () => (ctx, next) => {
  ctx.confirm = (reply, yesCommand, noCommand, options) => {
    ctx.session.set('confirm', { yesCommand, noCommand, options });
    return ctx.replySimple(reply, ['да', 'нет']);
  };
  return next(ctx);
};
