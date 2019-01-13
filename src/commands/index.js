'use strict';
const storage = require('../storage');
const utils = require('../utils');
const Fuse = require('fuse.js');
const matchers = require('../matchers');
const yaml = require('js-yaml');
const fs = require('fs');


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

// процесс удаления вопроса
// action
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
      return await ctx.confirm('Не знаю такого, рассказать, что знаю?', module.exports.known, ctx =>
        ctx.replyRandom(['ОК', 'Молчу', 'Я могу и всё забыть...'])
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

  // tour step 3
  if (ctx.user.state.tourStep === 'forget') {
    ctx.user.state.tourStep = '';
    // storage.setState(ctx.userData, ctx.user.state);
    return await ctx.replySimple(
      [
        'Прекрасно, теперь вы умеете пользоваться сценарием "список покупок".',
        'Чтобы узнать, как ещё можно использовать вторую память, скажите "примеры".',
        'Чтобы узнать обо всех командах, скажите "помощь".'
      ],
      ['примеры', 'помощь', 'первая помощь']
    );
  }

  return ctx.reply('Забыла, что ' + question);
};

// команда "что ..."
module.exports.whatIs = async ctx => {
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
};

// команда "где ...""
module.exports.whereIs = ctx => {
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
};

// команда "запомни ${question} находится ${answer}"
module.exports.remember = async ctx => {
  return processRemember(ctx, ctx.message);
};

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
module.exports.processRemember = processRemember;

// команда "что ты знаешь"
module.exports.known = async ctx => {
  ctx.chatbase.setIntent('known');
  ctx.logMessage(`> ${ctx.message} (known)`);

  // buttons
  let questions = ctx.user.data.map(item => item.questions[0]);
  const buttons = questions.map(question => 'что ' + question);

  // text
  let text = [];
  if (questions.length > 0) {
    text.push('Я знаю об этом:\n');
    text.push(questions.join(',\n'));
  } else {
    ctx.chatbase.setNotHandled();
    text.push('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  return ctx.replySimple(text, buttons);
};

// ответ на непонятное
module.exports.dontKnow = async ctx => {
  ctx.chatbase.setNotHandled();
  ctx.logMessage(`> ${ctx.message} (dontKnow)`);

  return ctx.reply('Я не знаю хороший ответ на этот вопрос');
};

// команда "удали последнее"
module.exports.deleteLast = async ctx => {
  ctx.chatbase.setIntent('deleteLast');
  ctx.logMessage(`> ${ctx.message} (deleteLast)`);

  if (!ctx.user.state.lastAddedItem) {
    ctx.chatbase.setNotHandled();
    return ctx.reply('Я ничего не запоминала в последнее время...');
  }
  const question = ctx.user.state.lastAddedItem.questions[0];
  return processDelete(ctx, question);
};

// команда "удали ..."
module.exports.deleteQuestion = async ctx => {
  ctx.chatbase.setIntent('deleteQuestion');
  ctx.logMessage(`> ${ctx.message} (deleteQuestion)`);

  // const question = ctx.body.question;
  const question = ctx.message.replace(/(забудь |удали(ть)? )(что )?(где )?/, '');
  return processDelete(ctx, question);
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
      return ctx.replySimple(confirm.reply, ['да', 'нет']);
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

// команда "что нового", changelog
module.exports.changelog = async ctx => {
  const logLimit = 5; // максимум изменений, которые выдаются за один раз

  ctx.chatbase.setIntent('changelog');
  ctx.logMessage(`> ${ctx.message} (changelog)`);

  // текст начала ответа
  let textBegin = '';
  if (ctx.user.state.visitor.visits > 1) {
    textBegin = 'С вашего последнего посещения я';
  } else {
    textBegin = 'В 2019 году я';
  }

  // дата, от которой читать лог
  let fromDate = new Date(0);
  if (ctx.user.state.visitor.lastChangelogDate) {
    fromDate = new Date(ctx.user.state.visitor.lastChangelogDate);
  } else {
    ctx.user.state.visitor.lastChangelogDate = new Date(ctx.user.state.visitor.lastVisitDate || 0);
  }
  fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  // получение строк лога
  const doc = yaml.safeLoad(fs.readFileSync('changelog-bot.yml', 'utf-8'));
  const fullLog = Object.entries(doc).map(line => {
    return {
      date: line[0],
      text: line[1]
    };
  });
  let matchedLog = fullLog.filter(logLine => {
    const match = logLine.date.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    const day = match[1];
    const month = match[2] - 1;
    const year = match[3];
    const logDate = new Date(year, month, day);

    return fromDate.getTime() <= logDate.getTime();
  });
  let matchedCount = matchedLog.length;

  // ничего не нашлось
  if (matchedCount == 0) {
    return await ctx.reply(textBegin + ' ничему не научилась');
  }

  // нашлось слишком много
  if (matchedCount > logLimit) matchedLog = matchedLog.slice(0, logLimit + 1);

  const textEnd = matchedCount > logLimit ? '.\nИ это еще не всё!' : '';

  // текст с датами для чтения глазами, даты не произносятся
  let logText = matchedLog.map(logLine => `${logLine.date}: ${logLine.text}`).join(',\n');
  logText = textBegin + ':\n' + logText + textEnd;
  let logTTS = matchedLog.map(logLine => `${logLine.text}`).join(',\n');
  logTTS = textBegin + ':\n' + logTTS + textEnd;
  // console.log('logText: ', logText);
  // console.log('logTTS: ', logTTS);

  return await ctx.reply(logText, [], { tts: logTTS });
};
