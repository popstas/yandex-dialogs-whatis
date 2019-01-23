// убирает незначимые части
module.exports = () => (ctx, next) => {
  ctx.message = ctx.message.replace(/^(ну )?(и )?/i, '');
  ctx.message = ctx.message.replace(/(^|\s)же($|\s)/i, ' ');
  ctx.message = ctx.message.replace(/(^|\s)то($|\s)/i, ' ');
  ctx.message = ctx.message.replace(/(^|\s)пожалуйста($|\s)/i, ' ');
  ctx.message = ctx.message.trim();
  ctx.message = ctx.message.replace(/^(Алиса )?(привет )?(слушай )?(а )?(тогда )?(скажи )?(напомни )?/i, '');

  ctx.message = ctx.message.replace(/ запомни$/i, '');
  ctx.message = ctx.message.replace(/ алиса$/i, '');

  // скажи подразумевает запись, а "что" здесь естественно напрашивается
  if (ctx.originalUtterance.match(/^скажи/i)) {
    ctx.message = ctx.message.replace(/^что /i, '');
  }

  ctx.data.request.command = ctx.message; // for string commands match

  return next(ctx);
};
