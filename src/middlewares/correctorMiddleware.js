// исправляет типичные ошибки распознавания
module.exports = () => {
  return async ctx => {
    ctx.message = ctx.message.replace('находиться', 'находится');
    return ctx;
  };
};
