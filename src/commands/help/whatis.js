module.exports = {
  matcher: ['отвечать что', 'отвечает что', 'что'],

  handler(ctx) {
    ctx.chatbase.setIntent('helpWhatis');
    ctx.logMessage(`> ${ctx.message} (helpWhatis)`);
  
    const buttons = ['что на дворе', 'что в среду в столовой', 'что на ужин'];
    return ctx.replySimple(
      [
        'Начните фразу со "что", чтобы получить ответ. Например: "что на дворе".',
        'Вы можете задавать вопросы со смыслом "что где" и "что когда". Например:',
        buttons.join(',\n')
      ],
      buttons
    );
    }
};
