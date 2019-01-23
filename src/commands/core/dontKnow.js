module.exports = {
  intent: 'dontKnow',
  matcher: ctx => ctx.message.match(/^(как|зачем|почему) /i) ? 0.01 : 0,

  handler(ctx) {
    ctx.chatbase.setNotHandled();
    ctx.logMessage(`> ${ctx.message} (dontKnow)`);

    return ctx.reply('Я не знаю хороший ответ на этот вопрос');
  }
};
