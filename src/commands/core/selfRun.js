module.exports = {
  intent: 'selfRun',
  matcher: 'запусти навык 2 память',

  handler(ctx) {
    return ctx.reply('Я уже тут');
  }
};
