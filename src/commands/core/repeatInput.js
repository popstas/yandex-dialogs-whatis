// повторяет последнюю услышанное (для устройств без экрана)
module.exports = {
  intent: 'repeatInput',
  matcher: /что ты услышала/,

  handler(ctx) {
    return ctx.reply(ctx.user.state.lastRequest.request);
  }
};
