// убирает незначимые части
module.exports = () => (ctx, next) => {
  ctx.message = ctx.message.replace(/^(Алиса )?(привет )?(слушай )?(а )?(тогда )?(скажи )?(напомни )?/, '');
  ctx.message = ctx.message.replace(/^(ну )?(и )?/, '');
  ctx.message = ctx.message.replace(/(^|\s)же($|\s)/, ' ');
  ctx.message = ctx.message.replace(/(^|\s)то($|\s)/, ' ');

  ctx.message = ctx.message.replace(/ запомни$/, '');

  // скажи подразумевает запись, а "что" здесь естественно напрашивается
  if (ctx.originalUtterance.toLowerCase().match(/^скажи/)) {
    ctx.message = ctx.message.replace(/^что /, '');
  }

  ctx.data.request.command = ctx.message; // for string commands match

  return next(ctx);
};
