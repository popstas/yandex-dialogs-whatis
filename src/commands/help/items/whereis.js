module.exports = {
  intent: 'helpWhereis',
  matcher: ['отвечать где', 'где'],

  async handler(ctx) {
    const buttons = ['где трава', 'где находится трава', 'где вода'];
    return ctx.reply(
      [
        'Начните фразу с "где", чтобы найти место, где это что-то лежит.',
        'Примеры:',
        buttons.join(',\n')
      ],
      buttons
    );
  }
};
