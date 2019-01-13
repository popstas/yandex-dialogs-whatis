module.exports = {
  matcher: 'тур',

  async handler(ctx) {
    ctx.chatbase.setIntent('tour');
    ctx.logMessage(`> ${ctx.message} (tour)`);

    ctx.user.state.tourStep = 'remember';
    // storage.setState(ctx.userData, ctx.user.state);
    return await ctx.replySimple(
      'Допустим, вы собрались в магазин. Скажите: "в магазине надо купить хлеб"',
      ['в магазине надо купить хлеб']
    );
  }
};
