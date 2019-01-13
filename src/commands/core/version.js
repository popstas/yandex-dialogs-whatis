const packageJson = require('../../../package.json');

module.exports = {
  matcher: 'версия',

  handler(ctx) {
    ctx.chatbase.setIntent('version');
    ctx.logMessage(`> ${ctx.message} (version)`);

    return ctx.reply(packageJson.version, [], {
      tts: packageJson.version.split('.').join(' точка ')
    });
  }
};
