// спрашивает подтверждение
module.exports = () => (ctx, next) => {
  // сбросить подтверждение, если человек вышел-звшел
  if(ctx.message == ''){
    ctx.session.set('confirm', null);
  }

  ctx.confirm = async (reply, yesCommand, noCommand, options) => {
    ctx.session.set('confirm', { yesCommand, noCommand, options, reply });
    return await ctx.reply(reply, ['да', 'нет']);
  };

  return next(ctx);
};
