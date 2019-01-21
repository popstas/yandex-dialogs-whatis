// простое связывание разных Алис по одноразовому коду
const storage = require('../../storage');
const expireSeconds = 30;

module.exports = {
  intent: 'authCodeGenerate',
  matcher: /(создай|сгенерируй|скажи) (код|пин|пароль)/,

  async handler(ctx) {
    const code = Math.floor(Math.random() * 999999) + 100000;
    if (!ctx.user.shared.codes) ctx.user.shared.codes = [];

    // check for duplicates
    if (ctx.user.shared.codes.find(item => item.code == code)) {
      return ctx.reply('Повторите еще раз, пожалуйста');
    }

    // delete other user's codes
    ctx.user.shared.codes = ctx.user.shared.codes.filter(item => item.userId != ctx.userId);

    // add new code
    ctx.user.shared.codes.push({
      code: code,
      userId: ctx.userId,
      expire: new Date().getTime() + expireSeconds * 1000
    });

    // delete expired
    ctx.user.shared.codes = ctx.user.shared.codes.filter(item => item.expire > new Date().getTime());

    await storage.setShared(ctx.userData, ctx.user.shared);

    return ctx.reply(`${code}`.split().join(' '));
  }
};
