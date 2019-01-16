module.exports = {
  intent: 'howMany',
  matcher: /^(сколько) /,

  async handler(ctx) {
    ctx.chatbase.setNotHandled();
    return ctx.reply('Я не умею отвечать на вопрос "сколько", только "что", "где" или список покупок.')
  }
};
