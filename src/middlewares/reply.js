const { Reply, Markup } = require('yandex-dialogs-sdk');
const storage = require('../storage');

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
