const { Reply, Markup } = require('yandex-dialogs-sdk');
const storage = require('../storage');

const effects = [
  '-', // нет эффекта
  'behind_the_wall', // голос из-за стены
  'hamster', // голос хомяка
  'megaphone', // голос через мегафон
  'pitch_down', // низкий голос
  'psychodelic', // психоделический голос
  'pulse', // голос с прерываниями
  'train_announce' // громкоговоритель на вокзале
];

const onShutdown = async (ctx, text) => {
  // send yandex metrika
  text = text.substring(0, 100);
  let url = `d://${ctx.message}/${text}`;
  ctx.yametrika.onShutdown(url);
  ctx.user.state.referer = url;

  ctx.chatbase.sendEvent(text);

  // последний запрос и ответ, для контекста
  ctx.user.state.lastRequest = {
    request: ctx.message,
    entities: ctx.entities,
    response: text
  };

  // store state
  await storage.setState(ctx.userData, ctx.user.state);
};

const ttsFromText = msg => {
  const articles = {
    стоит: 'сто+ит'
  };

  // ставит ударения
  Object.entries(articles).map(pair => {
    [search, replace] = pair;
    msg = msg.replace(new RegExp(search), replace);
  });

  // заменяет сокращенные эффекты на полные, '[megaphone]' => '<speaker effect="megaphone"}>'
  effects.forEach(effect => {
    const search = `\\[${effect}\\]`;
    const replace = `<speaker effect="${effect}">`;
    msg = msg.replace(new RegExp(search), replace);
  });

  return msg;
};

// убирает разметку из текста
const clearText = msg => {
  // убирает сокращенные эффекты
  effects.forEach(effect => {
    const search = `\\[${effect}\\]`;
    msg = msg.replace(new RegExp(search), '');
  });

  return msg;
};

module.exports = () => (ctx, next) => {
  ctx.reply = async (lines, buttons, params = {}) => {
    let text = '';
    let resultButtons = [];

    // строка
    if (typeof lines === 'string') text = lines;
    // массив строк
    else if (Array.isArray(lines)) text = lines.join('\n');
    // сырой объект yandex api
    else if (typeof lines === 'object') {
      text = lines.text;
      params = { ...params, ...lines };
    }

    // создание tts с фиксами типичных проблем
    if (!params.tts) {
      params.tts = ttsFromText(text);
      if (params.tts == text) delete params.tts;
    }

    // убирает придуманный язык
    text = clearText(text);

    if (Array.isArray(buttons)) {
      resultButtons = buttons.map(button => Markup.button(button));
    }

    await onShutdown(ctx, text);

    // log outgoing message
    if (ctx.message != 'ping') ctx.logMessage(`< ${text.split('\n').join(' [n] ')}`);

    return Reply.text(text, { ...{ buttons: resultButtons }, ...params });
  };

  return next(ctx);
};
