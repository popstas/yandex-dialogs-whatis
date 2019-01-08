const longPauseDays = 3;
const maxVisitPauseMins = 10;

// запоминает последнее посещение юзера и несколько других метрик
module.exports = () => (ctx, next) => {
  // юзер
  ctx.user.state.visitor = ctx.user.state.visitor || {
    visits: 0, // кол-во визитов (визит - группа сообщений в пределах 10 минут)
    lastMessageDate: 0, // время последнего сообщения навыку
    lastMessageLong: false // давно не был в навыке
  };

  // визит
  ctx.user.state.visit = ctx.user.state.visit || {
    messages: 0
  };

  // returning visitor
  const last = new Date(ctx.user.state.visitor.lastMessageDate);
  const delta = new Date().getTime() - last;
  ctx.user.state.visitor.lastMessageLong = delta > 86400 * longPauseDays * 1000;

  const isNewVisit = delta > maxVisitPauseMins * 60 * 1000;

  if (isNewVisit) {
    ctx.user.state.visitor.visits++;
    if (ctx.message != 'ping') {
      console.log('');
      ctx.logMessage(
        `new visit: ${ctx.user.state.visitor.visits}` +
          (ctx.user.state.visitor.visits > 1
            ? `, last visit has ${ctx.user.state.visit.messages} messages`
            : '')
      );
    }

    ctx.user.state.visit = {
      messages: 0
    };
  }

  ctx.user.state.visitor.lastMessageDate = new Date().getTime();
  ctx.user.state.visit.messages++;

  return next(ctx);
};
