const utils = require('../../utils');
const commands = require('../../commands');

module.exports = {
  intent: '',
  matcher: null,

  async handler(ctx) {
    if (ctx.message != 'ping') ctx.logMessage(`> ${ctx.message} (any)`);

    // время без глагола
    if (
      ctx.message.match(
        /(вчера|завтра|сегодня|понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)/i
      )
    ) {
      ctx.chatbase.setNotHandled();
      return ctx.reply(
        'Вам нужно добавить глагол, например, запомни что завтра БУДЕТ завтра',
        ['как запомнить', 'примеры']
      );
    }

    // определение частей фразы без глагола
    const cleanMsg = ctx.message.replace(/^запомни /, '').replace(/^что /, '');
    const posts = utils.getMsgPosts(cleanMsg);
    const words = cleanMsg.split(' ');
    prepIndex = posts.indexOf('PREP');
    if (prepIndex != -1) {
      const question = words.slice(prepIndex, prepIndex + 2);
      const answer = prepIndex === 0 ? words.slice(prepIndex + 2) : words.slice(0, prepIndex);
      const possibleMsg = question.join(' ') + ' находится ' + answer.join(' ');
      ctx.chatbase.setIntent('rememberConfirm');
      return ctx.confirm(
        `Вы хотите запомнить: ${possibleMsg}?`,
        ctx => commands.items.remember.processRemember(ctx, possibleMsg),
        ctx => {
          ctx.chatbase.setNotHandled();
          return ctx.replyRandom(
            [
              'Я такое не понимаю...',
              'Ну тогда не знаю... Попробуйте добавить глагол, так я лучше понимаю',
              'Если вы правда имели в виду что что-то где-то находится, я это скоро пойму... Заходите через недельку'
            ],
            ['помощь']
          );
        }
      );
    }

    // неопределенное запомни
    if (ctx.message.match(/^запомни /)) {
      ctx.chatbase.setNotHandled();
      return ctx.reply('Вам нужно добавить глагол, например, на дворе растёт трава', [
        'как запомнить',
        'примеры'
      ]);
    }

    ctx.chatbase.setNotHandled();
    return ctx.replyRandom(
      [
        'Не поняла',
        'О чём вы?',
        'Может вам нужна помощь? Скажите "помощь"',
        'Похоже, мы друг друга не понимаем, скажите "примеры"'
      ],
      ['помощь', 'примеры']
    );
  }
};
