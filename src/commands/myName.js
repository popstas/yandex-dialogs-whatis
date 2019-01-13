module.exports = {
  matcher: /^меня зовут /,

  async handler(ctx) {
    ctx.chatbase.setIntent('myName');
    ctx.chatbase.setNotHandled();
    ctx.logMessage(`> ${ctx.message} (myName)`);

    return ctx.reply('Боитесь забыть своё имя? Я не буду это запоминать!');
  }
};
