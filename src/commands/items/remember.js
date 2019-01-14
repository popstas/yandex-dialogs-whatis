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

  return ctx.reply(question + ' ' + verb + ' ' + answer + ', поняла');
};

// команда запомни ...
module.exports = {
  intent: '',
  matcher(ctx) {
    if (ctx.session.get('__currentScene') === 'rememberMaster') {
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
