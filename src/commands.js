'use strict';
const storage = require('./storage');
const Fuse = require('fuse.js');

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

// что ...
module.exports.whatIs = async ctx => {
  console.log('> question: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  const q = ctx.messsage.replace(/^что /, '');
  const data = await storage.getData(userData);

  if (data.length == 0) {
    return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  let fuse = new Fuse(data, {
    threshold: 0.3,
    location: 4,
    includeScore: true,
    keys: [
      {
        name: 'questions',
        weight: 0.7
      },
      {
        name: 'answer',
        weight: 0.1
      }
    ]
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

    console.log('answer: ', msg);
    ctx.reply(msg);
  } else {
    ctx.reply('Я не знаю');
  }
  return true;
};

// команды
module.exports.commands = ctx => {
  console.log('> commands');
  const commands = [
    'удалить',
    'забудь всё',
    'запомни в чем-то находится что-то',
    'отмена',
    'запомни',
    'пока'
  ];
  if (process.env.NODE_ENV != 'production') {
    commands.push('демо данные');
  }

  const replyMessage = ctx.replyBuilder;
  commands.map(command => {
    const btn = ctx.buttonBuilder.text(command).get();
    replyMessage.addButton({ ...btn });
  });
  // replyMessage.text('Вот что я умею:')
  return ctx.reply(replyMessage.get());
};

// запомни ${question} находится ${answer}
module.exports.remember = async ctx => {
  console.log('> full answer: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  const { question, answer } = ctx.body;
  await storage.storeAnswer(userData, question, answer);
  return ctx.reply(question + ' находится ' + answer + ', поняла');
};

// забудь всё
module.exports.clearData = async ctx => {
  console.log('> clear');
  const userData = await storage.getUserData(ctx);
  storage.clearData(userData);
  return ctx.reply('Всё забыла...');
};

// демо данные
module.exports.demoData = async ctx => {
  console.log('> demo data');
  const userData = await storage.getUserData(ctx);
  await storage.fillDemoData(userData);
  return ctx.reply('Данные сброшены на демонстрационные');
};

// команда по умолчанию (справка)
module.exports.help = async ctx => {
  console.log('> default');
  const userData = await storage.getUserData(ctx);
  const state = await storage.getState(userData);
  const replyMessage = ctx.replyBuilder;
  const helpText = [
    'Я умею запоминать, что где находится и напоминать об этом.',
    'Начните фразу со "что", чтобы получить ответ. Например: "что в синем".',
    'Скажите "запомни", чтобы добавить новый ответ.',
    'Можно быстро добавить новый ответ так: "запомни ... находится ..."'
  ];

  const data = await storage.getData(userData);
  let questions = data.map(item => item.questions[0]);
  questions = questions.map(question => {
    const btn = ctx.buttonBuilder.text('что ' + question);
    replyMessage.addButton({ ...btn.get() });
  });
  replyMessage.addButton(ctx.buttonBuilder.text('команды').get());

  if (questions.length > 0) {
    helpText.push('');
    helpText.push('У меня есть информация об этих объектах:');
  }
  replyMessage.text(helpText.join('\n'));
  // console.log('reply message: ', replyMessage.get());
  return ctx.reply(replyMessage.get());
};

// команда "отмена"
module.exports.cancel = async ctx => {
  console.log('> cancel');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  ctx.state.stage = STAGE_IDLE;
  ctx.state.question = '';
  ctx.state.answer = '';
  storage.setState(userData, ctx.state);
  return ctx.reply('Всё отменено');
};

// команда "пока"
module.exports.sessionEnd = ctx => {
  console.log('> end');
  return ctx.reply(
    ctx.replyBuilder
      .text('До свидания!')
      .shouldEndSession(true)
      .get()
  );
};

// команда "удалить"
module.exports.deleteLast = async ctx => {
  console.log('> remove');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  ctx.state.stage = STAGE_IDLE;
  ctx.state.question = '';
  ctx.state.answer = '';
  storage.setState(userData, ctx.state);

  return ctx.reply('Удален ответ: ' + ctx.state.lastAddedItem.questions.join(', '));
};

const processAnswer = async (ctx, userData) => {
  const q = ctx.messsage.replace(/^запомни/, '').trim();
  const replyMessage = ctx.replyBuilder;

  if (!ctx.state.stage || ctx.state.stage === STAGE_IDLE) {
    ctx.state.answer = '';

    if (q != '') {
      ctx.state.question = q;
      replyMessage.text('Что находится ' + q + '?');
      ctx.state.stage = STAGE_WAIT_FOR_ANSWER;
    } else {
      replyMessage.text('Что запомнить?');
    }
  } else if (ctx.state.stage === STAGE_WAIT_FOR_ANSWER) {
    ctx.state.answer = q;
    ctx.state.lastAddedItem = {
      questions: [ctx.state.question],
      answer: ctx.state.answer
    };

    ctx.state.stage = STAGE_IDLE;
    await storage.storeAnswer(userData, ctx.state.question, ctx.state.answer);

    replyMessage.text(ctx.state.question + ' находится ' + ctx.state.answer + ', поняла');
  }

  storage.setState(userData, ctx.state);
  return replyMessage.get();
};

// команда "запомни"
module.exports.inAnswerEnter = async ctx => {
  console.log('> answer begin: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const reply = await processAnswer(ctx, userData);
  return ctx.reply(reply);
};

module.exports.inAnswerProcess = async ctx => {
  console.log('> answer end: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const reply = await processAnswer(ctx, userData);
  if (ctx.state.stage == STAGE_IDLE) {
    ctx.session.setData('currentScene', null);
  }
  return ctx.reply(reply);
};
