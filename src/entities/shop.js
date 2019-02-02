const Az = require('az');

const postPairs = ['NOUN PROP NOUN', 'ADJF NOUN', 'NOUN'];

// задает ctx.entities.shop.add и remove
const plusMinusParse = ctx => {
  const replaceMap = {
    плюс: 'add',
    минус: 'remove',
    '+': 'add',
    '-': 'remove'
  };

  // 'плюс один минус два товар плюс три' ->
  // '|add один |remove два товар |add три' ->
  // ['add один', 'remove два товар', 'add три']
  const pairs = ctx.message
    .split(' ')
    .map(word => {
      if (replaceMap[word]) {
        word = '|' + replaceMap[word];
      }
      return word;
    })
    .join(' ')
    .replace(/^\|/, '')
    .split('|');

  const actions = [];
  pairs.forEach(pair => {
    const words = pair.trim().split(' ');
    const action = words.splice(0, 1)[0];
    const products = words.join(' ');
    if (!products) return;
    actions.push({ action, products });
  });

  return actions;
};

// распознает список покупок
module.exports = () => (ctx, next) => {
  ctx.entities = ctx.entities || {};

  const words = ctx.message.split(' ');

  // слова в начальных формах, сохраняется число у сущ. и прил.
  const infs = words.map(word => {
    const morph = Az.Morph(word);
    if (morph.length === 0) return '?';
    const inf = morph[0].normalize();
    const res = ['NOUN', 'ADJF'].includes(inf.tag.POST) // как минимум глагол не стоит ставить в ед.ч. из инфинитива
      ? inf.inflect(['NMbr', morph[0].tag.NMbr])
      : inf;
    return res ? res.word : inf.word;
  });

  if (!ctx.entities.shop) {
    ctx.entities.shop = {
      actions: [], // plusMinus only
      action: '',
      products: []
    };
  }

  // плюс-минус, как в https://dialogs.yandex.ru/store/skills/19170605-golosovoj-spisok-plyus-minus
  // главнее других
  const plusMinusWords = ['плюс', 'минус', '+', '-'];
  if (plusMinusWords.includes(infs[0])) {
    const actions = plusMinusParse(ctx);
    if (actions.length > 0) {
      ctx.entities.shop.action = 'plusMinus';
      ctx.entities.shop.actions = actions;
      return next(ctx);
    } else {
      ctx.entities.shop.action = 'listAny';
      return next(ctx);
    }
  }

  // пересечение массивов на магазинные слова
  const shopWords = ['магазин', 'купить', 'покупка', 'покупки', 'заказать', 'список', 'добавить', 'песок', 'удалить', 'удаль'];
  if (shopWords.filter(word => infs.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'list';
  }

  if (!ctx.entities.shop.action) return next(ctx);

  const addActionWords = ['добавить', 'купить', 'запомнить'];
  if (
    !ctx.message.match(/^что /i) &&
    addActionWords.filter(word => infs.indexOf(word) != -1).length > 0
  ) {
    ctx.entities.shop.action = 'add';
  }

  const removeActionWords = ['удаль', 'удалить', 'убрать', 'стереть', 'вычеркнуть'];
  if (removeActionWords.filter(word => infs.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'remove';
  }

  const clearActionWords = ['очистить'];
  if (clearActionWords.filter(word => infs.indexOf(word) != -1).length > 0) {
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
    let products = infs.filter(word => trashWords.indexOf(word) == -1);

    const productsPosts = products.map(product => {
      const morph = Az.Morph(product);
      if (morph.length === 0) return false;
      const post = morph[0].tag.POST;
      return post;
    });
    const productsPostsString = productsPosts.join(' ');

    const productsCombos = [];

    const comboIndexes = [];

    let i = 0;
    while (i < products.length) {
      const w = [
        products[i],
        products.length > i + 1 ? products[i + 1] : '',
        products.length > i + 2 ? products[i + 2] : ''
      ];

      const p = w.map(w => {
        const morph = Az.Morph(w);
        return (post = morph.length > 0 ? morph[0].tag.POST : '');
      });

      let found = false;
      for (let wordCount = 3; wordCount > 0; wordCount--) {
        if (!w[wordCount - 1]) continue;
        const str = w.slice(0, wordCount).join(' ');
        const postStr = p.slice(0, wordCount).join(' ');
        if (postPairs.includes(postStr)) {
          productsCombos.push(str);
          i += wordCount;
          found = true;
        }
      }
      if (!found) i++;
    }

    ctx.entities.shop.products = productsCombos.filter(Boolean);
    if (ctx.entities.shop.products.length == 0 && ctx.entities.shop.action != 'clear') {
      ctx.entities.shop.action = 'listAny'; // если не нашлось продуктов
    }
  }

  // console.log('ctx.entities: ', ctx.entities);
  return next(ctx);
};
