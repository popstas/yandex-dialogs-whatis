'use strict';
const storage = require('../storage');
const utils = require('../utils');
const Fuse = require('fuse.js');
const matchers = require('../matchers');
const { Reply } = require('yandex-dialogs-sdk');

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

// процесс ответа на вопрос, кажется, это называется fullfillment
// https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// process, action
const processAnswer = async ctx => {
  const q = ctx.message.replace(/^запомни/, '').trim();
  let answerText = '';

  if (!ctx.user.state.stage || ctx.user.state.stage === STAGE_IDLE) {
    ctx.user.state.answer = '';

    if (q != '') {
      // еще не знаем ни вопрос, ни ответ
      ctx.user.state.question = q;
      answerText = 'Что ' + q + '?';
      ctx.user.state.stage = STAGE_WAIT_FOR_ANSWER;
    } else {
      answerText = 'Что запомнить?';
    }
  } else if (ctx.user.state.stage === STAGE_WAIT_FOR_ANSWER) {
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
    ctx = await resetState(ctx);
  }

  storage.setState(ctx.userData, ctx.user.state);
  return answerText;
};

// процесс удаления вопроса
// action
const processDelete = async (ctx, question) => {
  ctx = await resetState(ctx);

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
    storage.setState(ctx.userData, ctx.user.state);
    // второй раз подряд не может удалить
    if (ctx.user.state.deleteFails > 1) {
      return ctx.confirm('Не знаю такого, рассказать, что знаю?', module.exports.known, ctx =>
        ctx.replyRandom(['ОК', 'Молчу', 'Я могу и всё забыть...'])
      );
    }
    return ctx.replyRandom([`Я не знаю про ${question}`, `Что за ${question}?`]);
  }
  ctx.user.state.deleteFails = 0;
  storage.setState(ctx.userData, ctx.user.state);

  // нашлось, но много
  if (found.length > 1) {
    console.log(found);
    return ctx.reply('Я не уверена что удалять... Могу забыть всё');
  }

  const isSuccess = await storage.removeQuestion(ctx.userData, question);
  if (!isSuccess) {
    return ctx.reply('При удалении что-то пошло не так...');
  }

  // tour step 3
  if (ctx.user.state.tourStep === 'forget') {
    ctx.user.state.tourStep = '';
    storage.setState(ctx.userData, ctx.user.state);
    return ctx.replySimple(
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

// очищает состояние заполнение ответа на вопрос
// action
const resetState = async ctx => {
  ctx.user.state.stage = STAGE_IDLE;
  ctx.user.state.question = '';
  ctx.user.state.answer = '';
  ctx.leave();
  // ctx.session.set('__currentScene', null);
  storage.setState(ctx.userData, ctx.user.state);
  return ctx;
};

// команда "что ..."
module.exports.whatIs = ctx => {
  ctx.logMessage(`> ${ctx.message} (whatis)`);
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

    // tour step 2
    if (ctx.user.state.tourStep === 'whatis') {
      ctx.user.state.tourStep = 'forget';
      storage.setState(ctx.userData, ctx.user.state);
      return ctx.replySimple(
        [
          msg,
          'Теперь вы купили хлеб и хотите забыть о нем. Скажите "забудь что в магазине" или "удали последнее"'
        ],
        ['забудь что в магазине', 'удали последнее']
      );
    }

    return ctx.reply(msg);
  } else {
    return ctx.replySimple(
      'Я не знаю. Если вы мне только что это говорили, значит, скорее всего, нужно поменять местами части фразы слева и справа от глагола. Скоро я научусь понимать сама, обещаю!',
      ['что ты знаешь']
    );
  }
};

// команда "где ...""
module.exports.whereIs = ctx => {
  ctx.logMessage(`> ${ctx.message} (whereis)`);
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

    return ctx.reply(msg);
  } else {
    return ctx.reply('Я не знаю');
  }
};

// команда "команды"
module.exports.commands = ctx => {
  ctx.logMessage(`> ${ctx.message} (commands)`);
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

  return ctx.replySimple(['Вот примеры разных команд:', buttons.join('\n')], buttons);
};

// команда "запомни ${question} находится ${answer}"
module.exports.remember = async ctx => {
  return processRemember(ctx, ctx.message);
};

const processRemember = async (ctx, msg) => {
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

  ctx = await resetState(ctx);
  // const suffix = utils.getVerb(ctx.message);

  // tour step 1
  if (ctx.user.state.tourStep === 'remember') {
    ctx.user.state.tourStep = 'whatis';
    storage.setState(ctx.userData, ctx.user.state);
    return ctx.replySimple(
      'Отлично, запомнила. Теперь вы зашли в магазин и хотите вспомнить, зачем. Скажите: "что надо купить в магазине"',
      ['что надо купить в магазине']
    );
  }

  return ctx.reply(question + ' ' + verb + ' ' + answer + ', поняла');
};
module.exports.processRemember = processRemember;

// команда "забудь всё"
module.exports.clearData = async ctx => {
  ctx.logMessage(`> ${ctx.message} (clearData)`);
  await storage.clearData(ctx.userData);
  ctx = await resetState(ctx);
  return ctx.reply('Всё забыла...');
};

// команда "забудь всё вообще"
module.exports.clearDataAll = async ctx => {
  ctx.logMessage(`> ${ctx.message} (clearDataAll)`);
  await storage.clearData(ctx.userData);
  ctx.user.state.lastWelcome = false;
  ctx.user.state.tourStep = '';
  ctx = await resetState(ctx);
  return ctx.reply('Вообще всё забыла...');
};

// команда "демо данные"
module.exports.demoData = async ctx => {
  ctx.logMessage(`> ${ctx.message} (demoData)`);
  await storage.fillDemoData(ctx.userData);
  ctx = await resetState(ctx);
  return ctx.reply('Данные сброшены на демонстрационные');
};

// команда "что ты знаешь"
module.exports.known = async ctx => {
  ctx.logMessage(`> ${ctx.message} (known)`);
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

  return ctx.replySimple(text, buttons);
};

// ответ на непонятное
module.exports.dontKnow = async ctx => {
  ctx.logMessage(`> ${ctx.message} (dontKnow)`);
  return ctx.reply('Я не знаю хороший ответ на этот вопрос');
};

// команда "отмена"
module.exports.cancel = async ctx => {
  ctx.logMessage(`> ${ctx.message} (cancel)`);
  ctx.leave();
  ctx = await resetState(ctx);
  return ctx.reply('Всё отменено');
};

// команда "пока"
module.exports.sessionEnd = async ctx => {
  ctx.logMessage(`> ${ctx.message} (sessionEnd)`);
  ctx = await resetState(ctx);
  return Reply.text('До свидания!', { end_session: true });
};

// команда "удали последнее"
module.exports.deleteLast = async ctx => {
  ctx.logMessage(`> ${ctx.message} (deleteLast)`);
  if (!ctx.user.state.lastAddedItem) {
    return ctx.reply('Я ничего не запоминала в последнее время...');
  }
  const question = ctx.user.state.lastAddedItem.questions[0];
  return processDelete(ctx, question);
};

// команда "удали ..."
module.exports.deleteQuestion = async ctx => {
  ctx.logMessage(`> ${ctx.message} (deleteQuestion)`);
  // const question = ctx.body.question;
  const question = ctx.message.replace(/(забудь |удали(ть)? )(что )?(где )?/, '');
  return processDelete(ctx, question);
};

// команда "запомни"
module.exports.inAnswerEnter = async ctx => {
  ctx.logMessage(`> ${ctx.message} (inAnswerEnter)`);
  ctx.enter('in-answer');
  const reply = await processAnswer(ctx);
  return ctx.reply(reply);
};

// процесс заполнение вопроса в сцене in-answer
module.exports.inAnswerProcess = async ctx => {
  ctx.logMessage(`> ${ctx.message} (inAnswerProcess)`);
  const reply = await processAnswer(ctx);
  if (ctx.user.state.stage == STAGE_IDLE) {
    ctx.leave();
    // ctx.session.set('__currentScene', null);
  }
  return ctx.reply(reply);
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
            ['Скажите "да" или "нет"', 'Не отстану, пока не получу ответ', 'А ответ-то какой?', confirm.reply],
            ['да', 'нет'],
          )
      }
    };
    if (ctx.message.match(/^повтори/)){
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
