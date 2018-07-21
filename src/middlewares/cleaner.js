// убирает незначимые части
module.exports = () => ctx => {
  ctx.message = ctx.message.replace(/^(Алиса )?(привет )?(слушай )?(а )?(скажи )?(напомни )?/, '');

  // костыль на "что надо купить"
  ctx.message = ctx.message.replace(/ надо купить/, ' купить');

  // скажи подразумевает запись, а "что" здесь естественно напрашивается
  if (ctx.req.request.original_utterance.toLowerCase().match(/^скажи/)) {
    ctx.message = ctx.message.replace(/^что /, '');
  }
  return ctx;
};
