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
    return ctx.entities.shop.action ? 0.95 : 0; //  должен быть > 0.9 < 1
  },

  async handler(ctx) {
    const opts = ctx.entities.shop;
    ctx.user.state.products = ctx.user.state.products || [];
    let text = '';

    const intent =
      module.exports.intent + opts.action.substr(0, 1).toUpperCase() + opts.action.substr(1);
    ctx.chatbase.setIntent(intent);

    let list = ctx.user.state.products;

    if (opts.action == 'add') {
      const add = opts.products.filter(product => product && list.indexOf(product) == -1);
      ctx.entities.shop.productsAdded = add; // для удали последнее
      ctx.user.state.products = [...list, ...add].filter(Boolean);
      text =
        add.length > 0
          ? 'Добавлены: ' + ctx.az.andList(add) + '.'
          : 'В списке уже есть ' + ctx.az.andList(opts.products) + '.';
      if (add.length < ctx.user.state.products.length) text += '\nПолный список:\n' + listText(ctx);

      // tour step 1
      if (ctx.user.state.tourStep === 'remember') {
        ctx.user.state.tourStep = 'whatis';
        return await ctx.reply(
          [
            'Добавлены: ' + ctx.az.andList(add) + '.',
            'Теперь вы собрались идти в магазин и хотите вспомнить, зачем. Скажите: "что надо купить в магазине"'
          ],
          ['что надо купить в магазине']
        );
      }
    }

    if (opts.action == 'remove') {
      const remove = opts.products.filter(product => product && list.indexOf(product) != -1);
      const notFound = opts.products.filter(product => product && list.indexOf(product) == -1);
      ctx.user.state.products = list.filter(product => product && remove.indexOf(product) == -1);

      text = remove.length > 0 ? 'Удалены: ' + ctx.az.andList(remove) + '.' : '';

      if (notFound.length > 0) {
        text += (text ? '.\n' : '') + notInListText(notFound) + '.';
      }

      text += '\nПолный список:\n' + listText(ctx);

      // tour step 3
      if (ctx.user.state.tourStep === 'forget') {
        if(remove.length > 0) ctx.user.state.tourStep = '';
        // storage.setState(ctx.userData, ctx.user.state);
        return await ctx.reply(
          remove.length > 0 ? [
            text + '.',
            'Прекрасно, теперь вы умеете пользоваться сценарием "список покупок".',
            'Чтобы узнать, как ещё можно использовать вторую память, скажите "примеры".',
            'Чтобы узнать обо всех командах, скажите "помощь".'
          ] : [
            text,
            `Не получилось удалить, я услышала: "${ctx.message}"`,
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

      const add = p.add.filter(product => product && list.indexOf(product) == -1);
      const remove = p.remove.filter(product => product && list.indexOf(product) != -1);
      const exists = p.add.filter(product => product && list.indexOf(product) != -1);
      const notFound = p.remove.filter(product => product && list.indexOf(product) == -1);

      ctx.entities.shop.productsAdded = add; // для удали последнее
      ctx.entities.shop.productsRemoved = remove; // для удали последнее

      ctx.user.state.products = [...list, ...add]; // add
      ctx.user.state.products = ctx.user.state.products.filter(
        product => product && remove.indexOf(product) == -1
      ); // remove

      const lines = [];
      if (add.length > 0) lines.push('Добавлены: ' + ctx.az.andList(add) + '.');
      if (remove.length > 0) lines.push('Удалены: ' + ctx.az.andList(remove) + '.');
      if (exists.length > 0) lines.push(ctx.az.andList(exists) + ' уже есть в списке.'); // отсутствуют
      if (notFound.length > 0) lines.push(notInListText(notFound)) + '.'; // отсутствуют
      if (add.length < ctx.user.state.products.length) {
        lines.push('\nПолный список:\n' + listText(ctx));
      }

      return await ctx.reply(lines, ['список покупок']);
    }

    if (opts.action == 'list' || opts.action == 'listAny') {
      if (opts.action == 'listAny' && ctx.user.state.products.length > 0) {
        text += 'Список покупок:\n';
      }
      text += listText(ctx);

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

    return await ctx.reply(text, ['что в магазине', 'добавить хлеб', 'удалить хлеб из списка']);
  }
};
