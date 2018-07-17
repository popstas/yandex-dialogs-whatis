// здесь функции по смыслу ближе к функционалу sdk

// простой конструктор ответа с кнопками
module.exports.simpleReply = (ctx, lines, buttons) => {
  const replyMessage = ctx.replyBuilder;
  for (let i in buttons) {
    replyMessage.addButton({ ...ctx.buttonBuilder.text(buttons[i]).get() });
  }
  return replyMessage.text(lines.join('\n'));
};

// генератор рандомного ответа
module.exports.simpleRandom = (ctx, messages, buttons) => {
  const randomKey = Math.floor(Math.random() * messages.length);
  return module.exports.simpleReply(ctx, [messages[randomKey]], buttons);
};

// команда рандомного ответа
