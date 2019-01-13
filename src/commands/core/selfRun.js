module.exports = {
  matcher: 'запусти навык 2 память',

  handler(ctx) {
    ctx.chatbase.setIntent('selfRun');
    ctx.logMessage(`> ${ctx.message} (selfRun)`);

    return ctx.reply('Я уже тут');
  }
};
