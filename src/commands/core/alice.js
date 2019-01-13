module.exports = {
  intent: 'alice',
  matcher: /(алиса|алису)/i,

  async handler(ctx) {
    ctx.chatbase.setNotHandled();
    return ctx.reply('Чтобы вернуться к Алисе, скажите "Алиса вернись"');
  }
};
