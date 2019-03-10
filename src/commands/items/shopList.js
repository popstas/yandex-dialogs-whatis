const deleteQuestion = require('./deleteQuestion');

const listText = ctx => {
  return ctx.user.state.products.length > 0
    ? ctx.user.state.products.join(',\n')
    : 'Список покупок пуст';
};

const notInListText = words => {
  return words.join(', ') + (words.length == 1 ? ' отсутствует' : ' отсутствуют') + ' в списке';
};

const listTextShort = ctx => {
  if (ctx.user.state.products.length > 5) {
    return 'В списке ' + ctx.az.pluralWord('продукт', ctx.user.state.products.length);
  }
  return (ctx.user.state.products.length > 0 ? 'Полный список:\n' : '') + listText(ctx);
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

    // добавить
    if (opts.action == 'add') {
      const add = opts.products.filter(product => product && list.indexOf(product) == -1);
      ctx.entities.shop.productsAdded = add; // для удали последнее
      ctx.user.state.products = [...list, ...add].filter(Boolean);
      text =
        add.length > 0
          ? 'Добавлены: ' + ctx.az.andList(add) + '.'
          : 'В списке уже есть ' + ctx.az.andList(opts.products) + '.';
      if (add.length < ctx.user.state.products.length) text += '\n' + listTextShort(ctx);

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

    // удалить
    if (opts.action == 'remove') {
      const remove = opts.products.filter(product => product && list.indexOf(product) != -1);
      const notFound = opts.products.filter(product => product && list.indexOf(product) == -1);
      ctx.user.state.products = list.filter(product => product && remove.indexOf(product) == -1);

      text = remove.length > 0 ? 'Удалены: ' + ctx.az.andList(remove) + '.' : '';

      if (notFound.length > 0) {
        text += (text ? '.\n' : '') + notInListText(notFound) + '.';

        // если ничего не найдено, пробуем удалить из общей базы знаний
        if (remove.length == 0) {
          return deleteQuestion.handler(ctx);
        }
      }

      text += '\n' + listTextShort(ctx);

      // tour step 3
      if (ctx.user.state.tourStep === 'forget') {
        if (remove.length > 0) ctx.user.state.tourStep = '';
        // storage.setState(ctx.userData, ctx.user.state);
        return await ctx.reply(
          remove.length > 0
            ? [
                text + '.',
                'Прекрасно, теперь вы умеете пользоваться сценарием "список покупок".',
                'Чтобы узнать, как ещё можно использовать вторую память, скажите "примеры".',
                'Чтобы узнать обо всех командах, скажите "помощь".',
                'Кстати, если вам интересны навыки на тему еды, попробуйте навыки "Вкусный список" и "Умный счётчик калорий"'
              ]
            : [text, `Не получилось удалить, я услышала: "${ctx.message}"`],
          [
            'примеры',
            'помощь',
            'первая помощь',
            {
              title: 'Вкусный список',
              url: 'https://dialogs.yandex.ru/store/skills/00203e6e-vtoraya-pamya',
              hide: true
            },
            {
              title: 'Умный счётчик калорий',
              url: 'https://dialogs.yandex.ru/store/skills/538d42cb-umnyj-schyotchik-kalo',
              hide: true
            }
          ]
        );
      }
    }

    // плюс минус
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
        if (ctx.user.state.products.length > 5) {
          lines.push('В списке ' + ctx.az.pluralWord('продукт', ctx.user.state.products.length));
        } else {
          lines.push('\nПолный список:\n' + listText(ctx));
        }
      }

      const buttons = ctx.user.state.products.length
        ? ctx.user.state.products.map(product => `- ${product}`)
        : ['список покупок'];

      return await ctx.reply(lines, buttons);
    }

    // список
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

    // очистка
    if (opts.action == 'clear') {
      ctx.user.state.products = [];
      text = 'Список покупок очищен';
    }

    const buttons = ctx.user.state.products.length
      ? ctx.user.state.products.map(product => `- ${product}`)
      : ['список покупок', 'добавить хлеб', 'удалить хлеб из списка'];
    return await ctx.reply(text, buttons);
  }
};
