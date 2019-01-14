const Az = require('az');

// распознает список покупок
module.exports = () => (ctx, next) => {
  ctx.entities = ctx.entities || {};

  const words = ctx.message.split(' ');
  const posts = words.map(word => {
    const morph = Az.Morph(word);
    if (morph.length === 0) return '?';
    return morph[0].tag.POST;
  });

  const inf = words.map(word => {
    const morph = Az.Morph(word);
    if (morph.length === 0) return '?';
    return morph[0].normalize().word;
  });

  if (!ctx.entities.shop) {
    ctx.entities.shop = {
      action: '',
      products: [],
      suggestionText: ''
    };
  }

  // пересечение массивов на магазинные слова
  const shopWords = ['магазин', 'купить', 'покупка', 'заказать', 'список'];
  if (shopWords.filter(word => inf.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'list';
  }

  if(!ctx.entities.shop.action) return next(ctx);

  const addActionWords = ['добавить', 'купить', 'запомнить'];
  if (
    !ctx.message.match(/^что /) &&
    addActionWords.filter(word => inf.indexOf(word) != -1).length > 0
  ) {
    ctx.entities.shop.action = 'add';
  }

  const removeActionWords = ['удаль', 'удалить', 'убрать', 'стереть', 'вычеркнуть'];
  if (removeActionWords.filter(word => inf.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'remove';
  }

  const clearActionWords = ['очистить'];
  if (clearActionWords.filter(word => inf.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'clear';
  }

  if (ctx.entities.shop.action) {
    const trashWords = [
      ...shopWords,
      ...addActionWords,
      ...removeActionWords,
      ...clearActionWords,
      ...['надо', 'добавить', 'список', 'покупка', 'еще', 'ещё', 'в', 'и', 'из']
    ];
    const products = inf.filter(word => trashWords.indexOf(word) == -1);
    ctx.entities.shop.products = products;

    /* ctx.entities.shop.suggestionText =
      '\nПохоже, вы хотели ' +
      (ctx.entities.shop.action == 'add'
        ? 'добавить в список покупок'
        : 'удалить из списка покупок') +
      ' следующее:\n' +
      ctx.entities.shop.products.join(',\n'); */
  }

  // console.log('ctx.entities: ', ctx.entities);
  return next(ctx);
};
