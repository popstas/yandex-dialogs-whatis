module.exports = {
  intent: 'known',
  matcher: [
    'что ты знаешь',
    'что ты помнишь',
    'ты знаешь',
    'что ты запомнила',
    'что ты поняла',
    'что ты хочешь'
  ],

  async handler(ctx) {
    // buttons
    let questions = ctx.user.data.map(item => item.questions[0]);
    const buttons = questions.map(question => 'что ' + question);

    if (ctx.user.state.products && ctx.user.state.products.length > 0) {
      questions.push('Список покупок: ' + ctx.user.state.products.length);
    }

    // text
    let text = [];
    if (questions.length > 0) {
      text.push('Я знаю об этом:');
      text.push(questions.join(',\n'));
    } else {
      ctx.chatbase.setNotHandled();
      text.push('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
    }

    return ctx.reply(text, buttons);
  }
};
