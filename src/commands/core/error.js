module.exports = {
  matcher: ctx => !!ctx.user.state.error,

  async handler(ctx) {
    console.log('! database error');
    return ctx.replyRandom([
      'Ой, что-то мне нехорошо, зайдите попозже...',
      'Пятьсоттретья ошибка, позовите админа! Хотя он уже наверное в курсе.',
      'Какой сейчас год? Кто я? Я потеряла память...'
    ]);
  }
};
