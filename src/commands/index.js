'use strict';
const storage = require('../storage');
const utils = require('../utils');
const matchers = require('../matchers');

// include recursive
var normalizedPath = require('path').join(__dirname, '.');
require('fs')
  .readdirSync(normalizedPath)
  .forEach(function(file) {
    const moduleName = file.split('.')[0];
    if (file !== 'index.js') exports[moduleName] = require('./' + file);
  });

// процесс ответа на вопрос, кажется, это называется fullfillment
// https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// process, action
const processAnswer = async ctx => {
  const q = ctx.message.replace(/^запомни/, '').trim();
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
};

// команда "запомни"
module.exports.inAnswerEnter = async ctx => {
  ctx.chatbase.setIntent('inAnswerEnter');
  ctx.logMessage(`> ${ctx.message} (inAnswerEnter)`);

  ctx.enter('in-answer');
  const reply = await processAnswer(ctx);
  return await ctx.reply(reply);
};

// процесс заполнение вопроса в сцене in-answer
module.exports.inAnswerProcess = async ctx => {
  ctx.chatbase.setIntent('inAnswerProcess');
  ctx.logMessage(`> ${ctx.message} (inAnswerProcess)`);

  const reply = await processAnswer(ctx);
  if (ctx.user.state.stage == 'STAGE_IDLE') {
    ctx.leave();
    // ctx.session.set('__currentScene', null);
  }
  return await ctx.reply(reply);
};

// команда подтверждения
module.exports.confirm = async ctx => {
  ctx.logMessage(`> ${ctx.message} (confirm)`);
  const confirm = ctx.session.get('confirm');
  if (confirm) {
    let cmd;
    const options = {
      ...confirm.options,
      ...{
        yesMatcher: matchers.yes(),
        noMatcher: matchers.no(),
        anyCommand: ctx =>
          ctx.replyRandom(
            [
              'Скажите "да" или "нет"',
              'Не отстану, пока не получу ответ',
              'А ответ-то какой?',
              confirm.reply
            ],
            ['да', 'нет']
          )
      }
    };
    if (ctx.message.match(/^повтори/)) {
      ctx.chatbase.setIntent('confirmRepeat');
      return ctx.reply(confirm.reply, ['да', 'нет']);
    } else if (options.yesMatcher(ctx)) {
      cmd = confirm.yesCommand;
    } else if (options.noMatcher(ctx)) {
      cmd = confirm.noCommand;
    }

    if (cmd) {
      ctx.session.set('confirm', null);
      return await cmd(ctx);
    }

    return options.anyCommand(ctx);
  }
};
