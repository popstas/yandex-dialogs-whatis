// иногда огрызаться на "да", сказанное без вопроса
module.exports = {
  intent: 'yes',
  matcher: ctx => ctx.message.toLowerCase() == 'да' && Math.random() > 0.7,

  handler(ctx) {
    ctx.chatbase.setNotHandled();

    return ctx.replyRandom(['белиберда', 'борода']);
  }
};
