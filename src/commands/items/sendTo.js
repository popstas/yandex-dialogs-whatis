// отправить список покупок на email
module.exports = {
  intent: 'sendTo',
  matcher: /^(отправь |передай |пришли |перешли |скинь |сбрось )(мне |список |покупок )+(в |на )(почту|телефон|смартфон|ivi|email|youtube)/i,
  async handler(ctx) {
    return ctx.reply('Скоро я научусь передавать список на электронную почту, пока не умею.');
  }
};
