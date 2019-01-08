// генерит виртуальный ip из userId
const ipFromUserId = userId => {
  const parts = [
    userId.substring(0, 2),
    userId.substring(2, 4),
    userId.substring(4, 6),
    userId.substring(6, 8)
  ];
  const ip = parts.map(part => parseInt(part, 16)).join('.');
  return ip;
};

// отправляет данные в яндекс метрику
module.exports = counter_id => (ctx, next) => {
  ctx.yametrika = require('yametrika').counter({ id: counter_id });

  // функцию нужно вызвать в самом конце, перед отправкой ответа пользователю
  ctx.yametrika.onShutdown = async url => {
    // передача данных в яндекс метрику
    if (process.env.NODE_ENV == 'production' && ctx.message != 'ping' && ctx.yametrika._id) {
      const visitParams = {
        messages: ctx.user.state.visit.messages
      };

      const userParams = {
        userID: ctx.data.session.user_id,
        userAgent: ctx.data.meta.client_id,
        visits: ctx.user.state.visitor.visits,
        __ymu: visitParams
      };

      ctx.yametrika._request = {
        url: url,
        referer: ctx.user.state.referer || '',
        'user-agent': ctx.data.meta.client_id,
        ip: ipFromUserId(ctx.data.session.user_id)
      };
      ctx.yametrika.hit('', '', '', userParams);
    }
  };

  return next(ctx);
};
