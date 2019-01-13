const utils = require('../../utils');
const Fuse = require('fuse.js');

module.exports = {
  matcher: /^(где|когда|в чем) /,

  async handler(ctx) {
    ctx.chatbase.setIntent('whereis');
    ctx.logMessage(`> ${ctx.message} (whereis)`);

    const q = utils.cleanQuestion(ctx.message);

    if (ctx.user.data.length == 0) {
      ctx.chatbase.setNotHandled();
      return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
    }

    let fuse = new Fuse(ctx.user.data, {
      threshold: 0.3,
      location: 4,
      includeScore: true,
      keys: ['answer']
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

      let msg = answers[0].questions[0];
      if (answers.filter(answer => !answer.minor).length > 1) {
        msg += ', но это неточно';
      }

      return ctx.reply(msg);
    } else {
      ctx.chatbase.setNotHandled();
      return ctx.reply('Я не знаю');
    }
  }
};
