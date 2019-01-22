// простое связывание разных Алис по одноразовому коду
const storage = require('../../storage');
const expireSeconds = 60;

module.exports = {
  intent: 'authCodeGenerate',
  matcher: /^(создай |сгенерируй |скажи )?(код|пин|пароль)( |$)/i,

  async handler(ctx) {
    ctx.user.shared.codes = ctx.user.shared.codes || [];

    // generate code
    const random = Math.floor(Math.random() * 999999);
    const code = `${random}`.padStart(6, '0');

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
    ctx.user.shared.codes = ctx.user.shared.codes.filter(
      item => item.expire > new Date().getTime()
    );

    await storage.setShared(ctx.userData, ctx.user.shared);

    const codeText = `${code}`.split('').join(' ');

    ctx.user.shared.auth = ctx.user.shared.auth || [];
    // есть редирект авторизации и он не на самого себя
    if (ctx.user.shared.auth[ctx.userId] && ctx.user.shared.auth[ctx.userId] != ctx.userId) {
      return ctx.replyRandom([
        `Это устройство связано с другим, лучше запросите код на главном устройстве, чтобы связать больше двух девайсов. Код: ${codeText}`,
        `Чтобы связать несколько устройств, спрашивайте код всё время на одном и том же устройстве. Код на ближайшую минуту: ${codeText}`,
        [
          'Сейчас вы привязаны к другому устройству, если привязать другое устройство к этому, они будут использовать разную память.',
          `Короче, вы не должны этого хотеть, если вы понимаете, что делаете, то код ${codeText}`
        ]
      ]);
    } else {
      return ctx.replyRandom([
        codeText,
        `${codeText}, [megaphone]у тебя есть минута, беги!`,
        `${codeText}, введите код на устройстве, которое хотите подключить`
      ]);
    }
  }
};
