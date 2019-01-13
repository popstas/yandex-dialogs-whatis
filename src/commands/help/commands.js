module.exports = {
  matcher: 'команды',

  handler(ctx) {
    ctx.chatbase.setIntent('commands');
    ctx.logMessage(`> ${ctx.message} (commands)`);

    const buttons = [
      'запомни в чем-то находится что-то',
      'удали последнее',
      'отмена',
      'забудь всё',
      'запомни',
      'что нового'
    ];
    if (process.env.NODE_ENV != 'production') {
      buttons.push('демо данные');
      buttons.push('приветствие');
    }

    return ctx.replySimple(['Вот примеры разных команд:', buttons.join(',\n')], buttons);
  }
};
