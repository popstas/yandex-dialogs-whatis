const deleteQuestion = require('./deleteQuestion');

module.exports = {
  intent: 'deleteLast',
  matcher: /^(забудь|удали(ть)?|убрать|убери|сотри|стереть|отмени(ть)?) ?(последнее|последний|последние|последнюю запись|это)?$/i,

  async handler(ctx) {
    const lastShopAction = ctx.user.state.lastRequest.entities.shop.action;

    // удалить добавленное
    if (lastShopAction == 'add') {
      const added = ctx.user.state.lastRequest.entities.shop.productsAdded;

      // удалить все продукты, добавленные в прошлый раз
      ctx.user.state.products = ctx.user.state.products.filter(p => added.indexOf(p) == -1);

      return await ctx.reply('Удалены ' + ctx.az.andList(added));
    }

    // удалить весь список
    if (lastShopAction == 'list' || lastShopAction == 'listAny') {
      return ctx.confirm(
        'Вы точно хотите очистить список покупок?',
        async ctx => {
          ctx.user.state.products = [];
          return await ctx.reply('Список покупок очищен');
        },
        ctx => ctx.reply('ОК')
      );
    }

    if (!ctx.user.state.lastAddedItem) {
      ctx.chatbase.setNotHandled();
      return ctx.reply('Я ничего не запоминала в последнее время...');
    }
    const question = ctx.user.state.lastAddedItem.questions[0];
    return deleteQuestion.processDelete(ctx, question);
  }
};
