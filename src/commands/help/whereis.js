module.exports = {
  matcher: ['отвечать где', 'где'],

  async handler(ctx) {
    ctx.chatbase.setIntent('helpWhereis');
    ctx.logMessage(`> ${ctx.message} (helpWhereis)`);

    const buttons = ['где трава', 'где находится трава', 'где вода'];
    return ctx.replySimple(
      [
        'Начните фразу с "где", чтобы найти место, где это что-то лежит.',
        'Примеры:',
        buttons.join(',\n')
      ],
      buttons
    );
  }
};
