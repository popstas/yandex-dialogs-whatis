// убирает незначимые части
module.exports = () => {
  return async ctx => {
    ctx.message = ctx.message.replace(/^(Алиса )?(привет )?(слушай )?(а )?(скажи )?(напомни )?/, '');
    return ctx;
  };
};
