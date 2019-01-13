const storage = require('../../storage');
const utils = require('../../utils');

const processRemember = async (ctx, msg) => {
  ctx.chatbase.setIntent('remember');
  ctx.logMessage(`> ${msg} (remember)`);

  // regexp
  const cleanMsg = msg.replace(/^запомни /, '').replace(/^что /, '');
  const { question, verb, answer } = utils.fixReversedRemember(utils.splitByVerb(cleanMsg));

  await storage.storeAnswer(ctx.userData, question, answer);

  // последний ответ можно удалить отдельной командой
  ctx.user.state.lastAddedItem = {
    questions: [question],
    answer: answer
  };

  ctx = await utils.resetState(ctx);
  // const suffix = utils.getVerb(ctx.message);

  // tour step 1
  if (ctx.user.state.tourStep === 'remember') {
    ctx.user.state.tourStep = 'whatis';
    // storage.setState(ctx.userData, ctx.user.state);
    return await ctx.replySimple(
      [
        question + ' ' + verb + ' ' + answer + ', поняла.',
        'Теперь вы собрались идти в магазин и хотите вспомнить, зачем. Скажите: "что надо купить в магазине"'
      ],
      ['что надо купить в магазине']
    );
  }

  return ctx.reply(question + ' ' + verb + ' ' + answer + ', поняла');
};

// команда запомни ...
module.exports = {
  matcher(ctx) {
    if (ctx.session.get('__currentScene') === 'in-answer') {
      ctx.message = ctx.message.replace(/^что /, '');
    }
    if (ctx.message.match(/^(что|кто) /)) return false;
    if (ctx.message.match(/^(где|когда|в чем) /)) return false;
    if (ctx.message.match(/^(как|зачем|почему) /)) return false;
    const cleanMsg = ctx.message.replace(/^запомни /, '');
    return !!utils.splitByVerb(cleanMsg);
  },

  async handler(ctx) {
    return processRemember(ctx, ctx.message)
  },

  processRemember: processRemember
};
