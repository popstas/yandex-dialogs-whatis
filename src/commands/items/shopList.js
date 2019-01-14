const listText = ctx => {
  return ctx.user.state.products.length > 0
    ? ctx.user.state.products.join(',\n')
    : 'Список покупок пуст';
};

const notInListText = words => {
  return words.join(', ') + (words.length == 1 ? ' отсутствует' : ' отсутствуют') + ' в списке';
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
      ctx.entities.shop.productsAdded = add; // для удали последнее
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

      text = remove.length > 0 ? 'Удалены: ' + remove.join(', ') : '';

      if (notFound.length > 0) {
        text += (text ? '.\n' : '') + notInListText(notFound) + '.';
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

    if (opts.action == 'plusMinus') {
      const p = { add: [], remove: [] };
      ctx.entities.shop.actions.forEach(item => {
        p[item.action].push(item.products);
      });

      const add = p.add.filter(product => list.indexOf(product) == -1);
      const remove = p.remove.filter(product => list.indexOf(product) != -1);
      const exists = p.add.filter(product => list.indexOf(product) != -1);
      const notFound = p.remove.filter(product => list.indexOf(product) == -1);

      ctx.entities.shop.productsAdded = add; // для удали последнее
      ctx.entities.shop.productsRemoved = remove; // для удали последнее

      ctx.user.state.products = [...list, ...add]; // add
      ctx.user.state.products = ctx.user.state.products.filter(
        product => remove.indexOf(product) == -1
      ); // remove

      const lines = [];
      if (add.length > 0) lines.push('Добавлены: ' + add.join(', ') + '.');
      if (remove.length > 0) lines.push('Удалены: ' + remove.join(', ') + '.');
      if (exists.length > 0) lines.push(exists.join(', ') + ' уже есть в списке.'); // отсутствуют
      if (notFound.length > 0) lines.push(notInListText(notFound)) + '.'; // отсутствуют
      if (add.length < ctx.user.state.products.length) {
        lines.push('\nПолный список:\n' + listText(ctx));
      }

      return await ctx.reply(lines, ['список покупок']);
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
