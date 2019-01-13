module.exports = {
  matcher: ['спс', 'спасибо', 'благодарю'],

  handler(ctx) {
    ctx.chatbase.setAsFeedback();
    ctx.chatbase.setIntent('thankyou');
    ctx.logMessage(`> ${ctx.message} (thankyou)`);

    return ctx.replyRandom([
      'Всегда пожалуйста',
      'Не за что',
      'Обращайся!',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста'
    ]);
  }
};
