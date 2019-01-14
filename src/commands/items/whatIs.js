const utils = require('../../utils');
const Fuse = require('fuse.js');

module.exports = {
  intent: 'whatis',
  matcher: /^(что|кто) /,

  async handler(ctx) {
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

      return ctx.reply(msg);
    } else {
      ctx.chatbase.setNotHandled();
      
      return ctx.replyRandom(
        [
          { text: 'Я не знаю', tts: 'Я не знаю, ' + ctx.message },
          {
            text:
              'Я не знаю' +
              ', если вы мне только что это говорили, значит, я не так записала, спросите "что ты знаешь"',
            tts:
              `Я не знаю, ${ctx.message}` +
              ', если вы мне только что это говорили, значит, я не так записала, спросите "что ты знаешь"'
          }
        ],
        ['что ты знаешь']
      );
    }
  }
};
