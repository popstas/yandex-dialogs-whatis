module.exports = {
  matcher: /(тупая|тупой|дура|идиотка)/i,

  handler(ctx) {
    ctx.chatbase.setIntent('abuse');
    ctx.chatbase.setNotHandled();
    ctx.chatbase.setAsFeedback();
    ctx.logMessage(`> ${ctx.message} (abuse)`);

    return ctx.replyRandom([
      'Вот сейчас обидно было...',
      'Я быстро учусь, вернитесь через пару дней и убедитесь...',
      'Я такая тупая...'
    ]);
  }
};
