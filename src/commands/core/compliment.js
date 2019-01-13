module.exports = {
  matcher: [
    'молодец',
    'ты молодец',
    'умница',
    'отлично',
    'прекрасно',
    'круто',
    'хорошо',
    'правильно',
    'правильно молодец'
  ],

  handler(ctx) {
    ctx.chatbase.setAsFeedback();
    ctx.chatbase.setIntent('compliment');
    ctx.logMessage(`> ${ctx.message} (compliment)`);

    return ctx.replyRandom([
      'Спасибо, стараюсь :)',
      'Ой, так приятно )',
      'Спасибо!',
      'Спасибо!',
      'Спасибо!',
      'Спасибо!',
      'Спасибо!'
    ]);
  }
};
