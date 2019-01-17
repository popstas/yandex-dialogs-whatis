// повторяет последнюю услышанное (для устройств без экрана)
module.exports = {
  intent: 'repeatInput',
  matcher: /что ты у?слышала/,

  handler(ctx) {
    return ctx.reply(ctx.user.state.lastRequest.request);
  }
};
