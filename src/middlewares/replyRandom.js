module.exports = () => async ctx => {
  ctx.replyRandom = messages => {
    const randomKey = Math.floor(Math.random() * messages.length);
    return ctx.reply(messages[randomKey]);
  };
  return ctx;
};
