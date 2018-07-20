module.exports = () => ctx => {
  ctx.replyRandom = (messages, buttons) => {
    const replyMessage = ctx.replyBuilder;

    const randomKey = Math.floor(Math.random() * messages.length);
    const lines = messages[randomKey];

    if (typeof lines === 'string') replyMessage.text(lines);
    else if (Array.isArray(lines)) replyMessage.text(lines.join('\n'));

    if (Array.isArray(buttons)) {
      for (let i in buttons) {
        replyMessage.addButton({ ...ctx.buttonBuilder.title(buttons[i]).get() });
      }
    }

    return ctx.reply(replyMessage.get());
  };
  return ctx;
};
