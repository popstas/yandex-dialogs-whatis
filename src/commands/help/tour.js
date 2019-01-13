module.exports = {
  intent: 'helpTour',
  matcher: 'тур',

  async handler(ctx) {
    ctx.user.state.tourStep = 'remember';
    // storage.setState(ctx.userData, ctx.user.state);
    return await ctx.replySimple(
      'Допустим, вы собрались в магазин. Скажите: "в магазине надо купить хлеб"',
      ['в магазине надо купить хлеб']
    );
  }
};
