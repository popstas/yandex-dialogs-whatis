module.exports = {
  matcher: /(алиса|алису)/i,

  async handler(ctx) {
    ctx.chatbase.setIntent('alice');
    ctx.chatbase.setNotHandled();
    ctx.logMessage(`> ${ctx.message} (alice)`);

    return ctx.reply('Чтобы вернуться к Алисе, скажите "Алиса вернись"');
  }
};
