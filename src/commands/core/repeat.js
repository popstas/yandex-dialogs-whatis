// повторяет последнюю реплику (для устройств без экрана)
module.exports = {
  intent: 'repeat',
  matcher: ['повтори', 'повторить', 'еще раз'],

  handler(ctx) {
    return ctx.user.state.lastRequest.reply;
  }
};
