module.exports = {
  intent: '',
  matcher: /^(как|зачем|почему) /,

  handler(ctx) {
    ctx.chatbase.setNotHandled();
    ctx.logMessage(`> ${ctx.message} (dontKnow)`);

    return ctx.reply('Я не знаю хороший ответ на этот вопрос');
  }
};
