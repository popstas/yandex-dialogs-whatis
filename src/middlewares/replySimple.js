module.exports = () => async ctx => {
  ctx.replySimple = (lines, buttons) => {
    const replyMessage = ctx.replyBuilder;

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
