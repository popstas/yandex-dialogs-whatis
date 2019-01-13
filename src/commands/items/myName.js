module.exports = {
  intent: 'myName',
  matcher: /^меня зовут /,

  async handler(ctx) {
    ctx.chatbase.setNotHandled();
    return ctx.reply('Боитесь забыть своё имя? Я не буду это запоминать!');
  }
};
