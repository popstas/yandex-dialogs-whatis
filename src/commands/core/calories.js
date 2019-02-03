module.exports = {
  intent: 'calories',
  matcher: /калори/,

  handler(ctx) {
    return ctx.reply('Чтобы запустить умный счетчик калорий, сначала скажите: "Алиса хватит", чтобы выйти из навыка "Вторая память"');
  }
};
