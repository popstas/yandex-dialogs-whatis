// ошибка с базой данных
module.exports = {
  intent: '',
  matcher: ctx => !!ctx.user.state.error,

  async handler(ctx) {
    console.log('! database error');
    return ctx.replyRandom([
      '[pitch_down]Ой, что-то мне нехорошо, зайдите попозже...',
      '[train_announce]Пятьсоттретья ошибка, позовите админа! [pitch_down]Хотя он уже наверное в курсе.',
      '[psychodelic]Какой сейчас год? Кто я? Я потеряла память...'
    ]);
  }
};
