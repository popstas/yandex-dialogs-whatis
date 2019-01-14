const listText = ctx => {
  return ctx.user.state.products.length > 0
    ? ctx.user.state.products.join(',\n')
    : 'Список покупок пуст';
};

module.exports = {
  intent: 'shopList',
  matcher(ctx) {
    return ctx.entities.shop.action ? 1 : 0;
  },

  async handler(ctx) {
    const opts = ctx.entities.shop;
    ctx.user.state.products = ctx.user.state.products || [];
    let text = '';

    let list = ctx.user.state.products;

    if (opts.action == 'add') {
      const add = opts.products.filter(product => list.indexOf(product) == -1);
      ctx.user.state.products = [...list, ...add];
      text =
        add.length > 0
          ? 'Добавлены: ' + add.join(', ') + '.'
          : 'В списке уже есть ' + opts.products.join(', ') + '.';
      if (add.length < ctx.user.state.products.length) text += '\nПолный список:\n' + listText(ctx);

      // tour step 1
      if (ctx.user.state.tourStep === 'remember') {
        ctx.user.state.tourStep = 'whatis';
        return await ctx.reply(
          [
            'Добавлены: ' + add.join(', ') + '.',
            'Теперь вы собрались идти в магазин и хотите вспомнить, зачем. Скажите: "что надо купить в магазине"'
          ],
          ['что надо купить в магазине']
        );
      }
    }

    if (opts.action == 'remove') {
      const remove = opts.products.filter(product => list.indexOf(product) != -1);
      const notFound = opts.products.filter(product => list.indexOf(product) == -1);
      ctx.user.state.products = list.filter(product => remove.indexOf(product) == -1);
      const notInListText = words => {
        return (
          words.join(', ') + (words.length == 1 ? ' отсутствует' : ' отсутствуют') + ' в списке'
        );
      };

      text = remove.length > 0 ? 'Удалены: ' + remove.join(', ') : '';

      if (notFound.length > 0) {
        text += (text ? '.\n' : '') + notInListText(notFound) +'.';
      }

      text += '\nПолный список:\n' + listText(ctx);

      // tour step 3
      if (ctx.user.state.tourStep === 'forget') {
        ctx.user.state.tourStep = '';
        // storage.setState(ctx.userData, ctx.user.state);
        return await ctx.reply(
          [
            'Прекрасно, теперь вы умеете пользоваться сценарием "список покупок".',
            'Чтобы узнать, как ещё можно использовать вторую память, скажите "примеры".',
            'Чтобы узнать обо всех командах, скажите "помощь".'
          ],
          ['примеры', 'помощь', 'первая помощь']
        );
      }
    }

    if (opts.action == 'list') {
      text = listText(ctx);

      // tour step 2
      if (ctx.user.state.tourStep === 'whatis') {
        ctx.user.state.tourStep = 'forget';
        // storage.setState(ctx.userData, ctx.user.state);
        return await ctx.reply(
          [
            'Список покупок:\n' + listText(ctx) + '.',
            'Теперь вы купили хлеб и хотите забыть о нем. Скажите "удали хлеб из списка"'
          ],
          ['удали хлеб из списка']
        );
      }
    }

    if (opts.action == 'clear') {
      ctx.user.state.products = [];
      text = 'Список покупок очищен';
    }

    return await ctx.reply(text, 'что в магазине', 'добавить хлеб', 'удалить хлеб из списка');
  }
};
