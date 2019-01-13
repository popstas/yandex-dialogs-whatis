module.exports = {
  matcher: ['что ты умеешь', 'что ты можешь', 'помощь', 'помоги'],

  handler(ctx) {
    ctx.chatbase.setIntent('help');
    if (ctx.message != 'ping') ctx.logMessage(`> ${ctx.message} (help)`);

    return ctx.replySimple(
      'Я умею запоминать, отвечать что, отвечать где или забывать. Что из этого вы хотите знать?',
      [
        'запоминать',
        'отвечать что',
        'отвечать где',
        'забывать',
        'что ты знаешь',
        'примеры',
        'первая помощь'
      ]
    );
  }
};
