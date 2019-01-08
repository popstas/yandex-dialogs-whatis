// отправляет данные в chatbase
module.exports = api_key => (ctx, next) => {
  if (!api_key) return next(ctx);

  
  ctx.chatbase = require('@google/chatbase')
    .setApiKey(api_key) // Your Chatbase API Key
    .setPlatform(ctx.data.meta.client_id) // The platform you are interacting with the user over

  // функцию нужно вызвать в самом конце, перед отправкой ответа пользователю
  ctx.chatbase.onShutdown = async text => {
    // запрос
    ctx.chatbase
      .newMessage()
      .setAsTypeUser()
      .setMessage(ctx.message)
      .setUserId(ctx.userId)
      .setCustomSessionId(ctx.sessionId)
      .setMessageId(ctx.messageId)
      .send()
      // .then(msg => console.log(msg.getCreateResponse()))
      .catch(err => console.error(err));

    // ответ
    ctx.chatbase
      .newMessage()
      .setAsTypeAgent()
      .setMessage(text)
      .setUserId(ctx.userId)
      .setCustomSessionId(ctx.sessionId)
      .setMessageId(ctx.messageId)
      .send()
      // .then(msg => console.log(msg.getCreateResponse()))
      .catch(err => console.error(err));
  };

  return next(ctx);
};
