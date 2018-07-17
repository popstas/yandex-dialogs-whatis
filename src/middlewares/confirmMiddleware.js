// спрашивает подтверждение, виртуально проговаривает фразу при ответе
module.exports = () => {
  return async ctx => {
    ctx.confirm = (reply, onYes, onNo) => {
      ctx.session.setData('confirm', { onYes, onNo });
      return ctx.reply(reply);
    };
    return ctx;
  };
};
