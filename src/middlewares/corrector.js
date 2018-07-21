// исправляет типичные ошибки распознавания
module.exports = () => ctx => {
  ctx.message = ctx.message.replace('находиться', 'находится');
  return ctx;
};
