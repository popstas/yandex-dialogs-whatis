// исправляет типичные ошибки распознавания
module.exports = () => async ctx => {
  ctx.message = ctx.message.replace('находиться', 'находится');
  return ctx;
};
