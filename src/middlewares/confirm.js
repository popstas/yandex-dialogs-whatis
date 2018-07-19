// спрашивает подтверждение
module.exports = () => async ctx => {
  ctx.confirm = (reply, yesCommand, noCommand, options) => {
    ctx.session.setData('confirm', { yesCommand, noCommand, options });
    return ctx.replySimple(reply, ['да', 'нет']);
  };
  return ctx;
};
