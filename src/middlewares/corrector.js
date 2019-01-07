// исправляет типичные ошибки распознавания
module.exports = () => (ctx, next) => {
  ctx.message = ctx.message.replace('находиться', 'находится');
  ctx.data.request.command = ctx.message; // for string commands match
  return next(ctx);
};
