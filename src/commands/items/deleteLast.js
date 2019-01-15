const deleteQuestion = require('./deleteQuestion');

module.exports = {
  intent: 'deleteLast',
  matcher: /^(удали|удалить|забудь) ?(последнее|последний|последние|последнюю запись)?$/i,

  async handler(ctx) {
    console.log('ctx.user.state.lastRequest: ', ctx.user.state.lastRequest);
    if (ctx.user.state.lastRequest.entities.shop.action == 'add') {
      const added = ctx.user.state.lastRequest.entities.shop.productsAdded;

      // удалить все продукты, добавленные в прошлый раз
      ctx.user.state.products = ctx.user.state.products.filter(p => added.indexOf(p) == -1);

      return await ctx.reply('Удалены ' + ctx.az.andList(added));
    }

    if (!ctx.user.state.lastAddedItem) {
      ctx.chatbase.setNotHandled();
      return ctx.reply('Я ничего не запоминала в последнее время...');
    }
    const question = ctx.user.state.lastAddedItem.questions[0];
    return deleteQuestion.processDelete(ctx, question);
  }
};
