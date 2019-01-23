const storage = require('../../storage');
const utils = require('../../utils');

// команда запомни ...
module.exports = {
  intent: 'rememberMaster',
  matcher: ['запомни', 'запоминай'],

  async handler(ctx) {
    ctx.enter('rememberMaster');
    const reply = await module.exports.processAnswer(ctx, ctx.message);
    return await ctx.reply(reply);
  },

  async rememberMasterProcess(ctx) {
    ctx.chatbase.setIntent('rememberMasterProcess');
    ctx.logMessage(`> ${ctx.message} (rememberMasterProcess)`);

    const reply = await module.exports.processAnswer(ctx);
    if (ctx.user.state.stage == 'STAGE_IDLE') {
      ctx.leave();
      // ctx.session.set('__currentScene', null);
    }
    return await ctx.reply(reply);
  },

  async processAnswer(ctx) {
    const q = ctx.message.replace(/^запомни/i, '').trim();
    let answerText = '';

    if (!ctx.user.state.stage || ctx.user.state.stage === 'STAGE_IDLE') {
      ctx.user.state.answer = '';

      if (q != '') {
        // еще не знаем ни вопрос, ни ответ
        ctx.user.state.question = q;
        answerText = 'Что ' + q + '?';
        ctx.user.state.stage = 'STAGE_WAIT_FOR_ANSWER';
      } else {
        answerText = 'Что запомнить?';
      }
    } else if (ctx.user.state.stage === 'STAGE_WAIT_FOR_ANSWER') {
      // уже знаем вопрос, но не знаем ответ
      const verb = utils.getVerb(q);
      ctx.user.state.answer = utils.cleanQuestion(q);
      if (ctx.user.state.answer == '') ctx.user.state.answer = q;

      // последний ответ можно удалить отдельной командой
      ctx.user.state.lastAddedItem = {
        questions: [ctx.user.state.question],
        answer: ctx.user.state.answer
      };

      await storage.storeAnswer(ctx.userData, ctx.user.state.question, ctx.user.state.answer);
      const msg =
        ctx.user.state.question + (verb ? ` ${verb} ` : ' ') + ctx.user.state.answer + ', поняла';
      answerText = msg;
      ctx = await utils.resetState(ctx);
    }

    // storage.setState(ctx.userData, ctx.user.state);
    return answerText;
  }
};
