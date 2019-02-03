const storage = require('../../storage');
const utils = require('../../utils');
const known = require('./known');

// процесс удаления вопроса
const processDelete = async (ctx, question) => {
  ctx = await utils.resetState(ctx);

  let found = ctx.user.data.filter(item => {
    return item.questions.indexOf(question) != -1;
  });
  if (found.length == 0) {
    // ищем по "где"
    found = ctx.user.data.filter(item => {
      return item.answer.indexOf(question) != -1;
    });
    if (found.length === 1) {
      question = found[0].questions[0];
    }
  }

  // не нашлось
  if (found.length == 0) {
    ctx.user.state.deleteFails = (ctx.user.state.deleteFails | 0) + 1;
    // storage.setState(ctx.userData, ctx.user.state);
    // второй раз подряд не может удалить
    if (ctx.user.state.deleteFails > 1) {
      ctx.chatbase.setIntent('knownConfirm');
      return await ctx.confirm(
        'Не знаю такого, рассказать, что знаю?',
        known.handler,
        ctx => ctx.replyRandom(['ОК', 'Молчу', 'Я могу и всё забыть...']),
        { optional: true }
      );
    }
    return await ctx.replyRandom([`Я не знаю про ${question}`, `Что за ${question}?`]);
  }
  ctx.user.state.deleteFails = 0;
  // storage.setState(ctx.userData, ctx.user.state);

  // нашлось, но много
  if (found.length > 1) {
    console.log(found);
    return await ctx.reply('Я не уверена что удалять... Могу забыть всё');
  }

  const isSuccess = await storage.removeQuestion(ctx.userData, question);
  if (!isSuccess) {
    return ctx.reply('При удалении что-то пошло не так...');
  }

  return ctx.reply('Забыла, что ' + question);
};

module.exports = {
  intent: 'deleteQuestion',
  matcher: ctx => (ctx.message.match(/(забудь|удали(ть)?|убрать|убери|сотри|стереть) (что )?.*/i) ? 0.9 : 0), // он ломал items.shopList

  async handler(ctx) {
    // const question = ctx.body.question;
    const question = ctx.message.replace(/(забудь |удали(ть)? )(что )?(где )?/i, '');

    return processDelete(ctx, question);
  },

  processDelete: processDelete
};
