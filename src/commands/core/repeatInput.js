// повторяет последнюю услышанное (для устройств без экрана)
module.exports = {
  intent: 'repeatInput',
  matcher: /(что ты у?слышала|ты глухая)/,

  handler(ctx) {
    return ctx.reply('Я услышала: ' + ctx.user.state.lastRequest.request);
  }
};
