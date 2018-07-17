// спрашивает подтверждение, виртуально проговаривает фразу при ответе
module.exports = () => async ctx => {
  ctx.confirm = (reply, onYes, onNo) => {
    ctx.session.setData('confirm', { onYes, onNo });
    return ctx.reply(reply);
  };
  return ctx;
};
