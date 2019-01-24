// версия
const packageJson = require('../../../package.json');

module.exports = {
  intent: 'version',
  matcher: /(\s|^)верси[яюи](\s|$)/,

  handler(ctx) {
    return ctx.reply(packageJson.version, [], {
      tts: packageJson.version.split('.').join(' точка ')
    });
  }
};
