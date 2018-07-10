'use strict';
const storage = require('../storage');
const utils = require('../utils');
const helpers = require('../helpers');
const Fuse = require('fuse.js');

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

// процесс ответа на вопрос, кажется, это называется fullfillment
// https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// process, action
const processAnswer = async ctx => {
  const q = ctx.message.replace(/^запомни/, '').trim();
  const replyMessage = ctx.replyBuilder;

  if (!ctx.user.state.stage || ctx.user.state.stage === STAGE_IDLE) {
    ctx.user.state.answer = '';

    if (q != '') {
      // еще не знаем ни вопрос, ни ответ
      ctx.user.state.question = q;
      replyMessage.text('Что ' + q + '?');
      ctx.user.state.stage = STAGE_WAIT_FOR_ANSWER;
    } else {
      replyMessage.text('Что запомнить?');
    }
  } else if (ctx.user.state.stage === STAGE_WAIT_FOR_ANSWER) {
    // уже знаем вопрос, но не знаем ответ
    const verb = utils.getVerb(q);
    ctx.user.state.answer = utils.cleanQuestion(q);

    // последний ответ можно удалить отдельной командой
    ctx.user.state.lastAddedItem = {
      questions: [ctx.user.state.question],
      answer: ctx.user.state.answer
    };

    await storage.storeAnswer(ctx.userData, ctx.user.state.question, ctx.user.state.answer);
    const msg =
      ctx.user.state.question + (verb ? ` ${verb} ` : ' ') + ctx.user.state.answer + ', поняла';
    replyMessage.text(msg);
    console.log(`< ${msg}`);
    ctx = await resetState(ctx);
  }

  storage.setState(ctx.userData, ctx.user.state);
  return replyMessage.get();
};

// процесс удаления вопроса
// action
const processDelete = async (ctx, question) => {
  ctx = await resetState(ctx);

  const found = ctx.user.data.filter(item => {
    return item.questions.indexOf(question) != -1;
  });

  // не нашлось
  if (found.length == 0) {
    return ctx.reply('Я не знаю, что ' + question);
  }
  // нашлось, но много
  if (found.length > 1) {
    console.log(found);
    console.log(`< Я не уверена что удалять...`);
    return ctx.reply('Я не уверена что удалять...');
  }

  const isSuccess = await storage.removeQuestion(ctx.userData, question);
  if (!isSuccess) {
    console.log(`< При удалении что-то пошло не так...`);
    return ctx.reply('При удалении что-то пошло не так...');
  }

  console.log('Забыла, что ' + question);
  return ctx.reply('Забыла, что ' + question);
};

// очищает состояние заполнение ответа на вопрос
// action
const resetState = async ctx => {
  ctx.user.state.stage = STAGE_IDLE;
  ctx.user.state.question = '';
  ctx.user.state.answer = '';
  storage.setState(ctx.userData, ctx.user.state);
  return ctx;
};

// команда "что ..."
module.exports.whatIs = async ctx => {
  console.log(`> ${ctx.message} (whatis)`);
  const q = utils.cleanQuestion(ctx.message);

  if (ctx.user.data.length == 0) {
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

    console.log(`< ${msg}`);
    ctx.reply(msg);
  } else {
    ctx.reply('Я не знаю');
  }
  return true;
};

// команда "где ...""
module.exports.whereIs = async ctx => {
  console.log(`> ${ctx.message} (whereis)`);
  const q = utils.cleanQuestion(ctx.message);

  if (ctx.user.data.length == 0) {
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

    console.log('answer: ', msg);
    ctx.reply(msg);
  } else {
    ctx.reply('Я не знаю');
  }
  return true;
};

// команда "команды"
module.exports.commands = ctx => {
  console.log(`> ${ctx.message} (commands)`);
  const buttons = [
    'запомни в чем-то находится что-то',
    'удали последнее',
    'отмена',
    'забудь всё',
    'запомни',
    'пока'
  ];
  if (process.env.NODE_ENV != 'production') {
    buttons.push('демо данные');
    buttons.push('приветствие');
  }

  const reply = helpers.simpleReply(
    ctx,
    ['Вот примеры разных команд:', buttons.join('\n')],
    buttons
  );
  return ctx.reply(reply.get());
};

// команда "запомни ${question} находится ${answer}"
module.exports.remember = async ctx => {
  console.log(`> ${ctx.message} (remember)`);
  // figures
  // const question = ctx.body.question.replace(/^запомни /, '').replace(/^что /, '');
  // const answer = ctx.body.answer;

  // regexp
  let [_, question, verb, answer] = utils.rememberRegex.exec(ctx.message);
  question = question.replace(/^запомни /, '').replace(/^что /, '');

  await storage.storeAnswer(ctx.userData, question, answer);

  // последний ответ можно удалить отдельной командой
  ctx.user.state.lastAddedItem = {
    questions: [question],
    answer: answer
  };

  ctx = await resetState(ctx);
  // const suffix = utils.getVerb(ctx.message);
  return ctx.reply(question + ' ' + verb + ' ' + answer + ', поняла');
};

// команда "забудь всё"
module.exports.clearData = async ctx => {
  console.log(`> ${ctx.message} (clear)`);
  await storage.clearData(ctx.userData);
  ctx.user.state.lastWelcome = false;
  ctx = await resetState(ctx);
  return ctx.reply('Всё забыла...');
};

// команда "демо данные"
module.exports.demoData = async ctx => {
  console.log(`> ${ctx.message} (demoData)`);
  await storage.fillDemoData(ctx.userData);
  ctx = await resetState(ctx);
  return ctx.reply('Данные сброшены на демонстрационные');
};

// команда "что ты знаешь"
module.exports.known = async ctx => {
  // buttons
  let questions = ctx.user.data.map(item => item.questions[0]);
  const buttons = questions.map(question => 'что ' + question);

  // text
  let text = [];
  if (questions.length > 0) {
    text.push('У меня есть информация об этих объектах:\n');
    text.push(questions.join('\n'));
  } else {
    text.push('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  return ctx.reply(helpers.simpleReply(ctx, text, buttons).get());
};

// команда "отмена"
module.exports.cancel = async ctx => {
  console.log(`> ${ctx.message} (cancel)`);
  ctx = await resetState(ctx);
  return ctx.reply('Всё отменено');
};

// команда "пока"
module.exports.sessionEnd = async ctx => {
  console.log(`> ${ctx.message} (sessionEnd)`);
  ctx = await resetState(ctx);
  return ctx.reply(
    ctx.replyBuilder
      .text('До свидания!')
      .shouldEndSession(true)
      .get()
  );
};

// команда "удали последнее"
module.exports.deleteLast = async ctx => {
  console.log(`> ${ctx.message} (deleteLast)`);
  if (!ctx.user.state.lastAddedItem) {
    return ctx.reply('Я ничего не запоминала в последнее время...');
  }
  const question = ctx.user.state.lastAddedItem.questions[0];
  return processDelete(ctx, question);
};

// команда "удали ..."
module.exports.deleteQuestion = async ctx => {
  console.log(`> ${ctx.message} (deleteQuestion)`);
  // const question = ctx.body.question;
  const [_, question] = ctx.message.match(/удали (.*)/);
  return processDelete(ctx, question);
};

// команда "запомни"
module.exports.inAnswerEnter = async ctx => {
  console.log(`> ${ctx.message} (inAnswerEnter)`);
  const reply = await processAnswer(ctx);
  return ctx.reply(reply);
};

// процесс заполнение вопроса в сцене in-answer
module.exports.inAnswerProcess = async ctx => {
  console.log(`> ${ctx.message} (inAnswerProcess)`);
  const reply = await processAnswer(ctx);
  if (ctx.user.state.stage == STAGE_IDLE) {
    ctx.session.setData('currentScene', null);
  }
  return ctx.reply(reply);
};
