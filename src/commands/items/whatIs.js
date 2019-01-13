const storage = require('../../storage');
const utils = require('../../utils');
const Fuse = require('fuse.js');

module.exports = {
  matcher: /^(что|кто) /,

  async handler(ctx) {
    ctx.chatbase.setIntent('whatis');
    ctx.logMessage(`> ${ctx.message} (whatis)`);

    const q = utils.cleanQuestion(ctx.message);

    if (ctx.user.data.length == 0) {
      ctx.chatbase.setNotHandled();
      return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
    }

    let fuse = new Fuse(ctx.user.data, {
      threshold: 0.3,
      location: 4,
      includeScore: true,
      keys: ['questions']
    });
    let answers = fuse.search(q);
    if (answers.length > 0) {
      const bestScore = answers[0].score;
      const scoreThreshold = 2;
      answers = answers.map(answer => {
        return {
          ...answer.item,
          ...{
            score: answer.score,
            minor: answer.score / bestScore > scoreThreshold
          }
        };
      });

      let msg = answers[0].answer;
      if (answers.filter(answer => !answer.minor).length > 1) {
        msg += ', но это неточно';
      }

      // tour step 2
      if (ctx.user.state.tourStep === 'whatis') {
        ctx.user.state.tourStep = 'forget';
        // storage.setState(ctx.userData, ctx.user.state);
        return await ctx.replySimple(
          [
            msg + '.',
            'Теперь вы купили хлеб и хотите забыть о нем. Скажите "удали последнее" или "забудь что в магазине"'
          ],
          ['забудь что в магазине', 'удали последнее']
        );
      }

      return ctx.reply(msg);
    } else {
      ctx.chatbase.setNotHandled();
      return ctx.replyRandom(
        [
          'Я не знаю',
          'Я не знаю, если вы мне только что это говорили, значит, я не так записала, спросите "что ты знаешь"'
        ],
        ['что ты знаешь']
      );
    }
  }
};
