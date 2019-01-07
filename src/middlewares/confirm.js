// спрашивает подтверждение
module.exports = () => (ctx, next) => {
  ctx.confirm = async (reply, yesCommand, noCommand, options) => {
    ctx.session.set('confirm', { yesCommand, noCommand, options, reply });
    return await ctx.replySimple(reply, ['да', 'нет']);
  };
  return next(ctx);
};
