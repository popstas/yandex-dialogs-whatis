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

// подключение всех команд группы (плоский список). Вложенные группы не будут подключены
module.exports.useCommands = (alice, commands) => {
  Object.entries(commands).forEach(entry => {
    [commandName, command] = entry;
    if (command.disabled || !command.matcher) return;
    module.exports.useCommand(alice, command);
  });
};

// добавляет в начало функции код из второго параметра
const handlerBefore = (handler, before) => ctx => {
  before(ctx);
  return handler(ctx);
};
