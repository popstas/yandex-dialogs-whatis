// подключение команд, которые возвращают { matcher, handler }
module.exports.useCommand = (alice, command) => {
  if (command.intent) {
    command.handler = handlerBefore(command.handler, ctx => {
      if (ctx.message != 'ping' && ctx.message != '') {
        ctx.chatbase.setIntent(command.intent);
        ctx.logMessage(`> ${ctx.message} (${command.intent})`);
      }
    });
  }
  alice.command(command.matcher, command.handler);
};

// добавляет в начало функции код из второго параметра
const handlerBefore = (handler, before) => ctx => {
  before(ctx);
  return handler(ctx);
};
