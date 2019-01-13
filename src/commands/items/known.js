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

    // text
    let text = [];
    if (questions.length > 0) {
      text.push('Я знаю об этом:\n');
      text.push(questions.join(',\n'));
    } else {
      ctx.chatbase.setNotHandled();
      text.push('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
    }

    return ctx.replySimple(text, buttons);
  }
};
