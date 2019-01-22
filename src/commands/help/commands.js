module.exports = {
  intent: 'helpCommands',
  matcher: 'команды',

  handler(ctx) {
    const buttons = [
      'запомни в чем-то находится что-то',
      'удали последнее',
      'отмена',
      'забудь всё',
      'запомни',
      'что нового',
      'авторизация'
    ];
    if (process.env.NODE_ENV != 'production') {
      buttons.push('демо данные');
      buttons.push('приветствие');
    }

    return ctx.reply(['Вот примеры разных команд:', buttons.join(',\n')], buttons);
  }
};
