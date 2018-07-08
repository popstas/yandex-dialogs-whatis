'use strict';
const storage = require('./storage');
const Fuse = require('fuse.js');

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

// процесс ответа на вопрос, кажется, это называется fullfillment
// https://github.com/dialogflow/dialogflow-fulfillment-nodejs
const processAnswer = async (ctx, userData) => {
  const q = ctx.message.replace(/^запомни/, '').trim();
  const replyMessage = ctx.replyBuilder;

  if (!ctx.state.stage || ctx.state.stage === STAGE_IDLE) {
    ctx.state.answer = '';

    if (q != '') {
      // еще не знаем ни вопрос, ни ответ
      ctx.state.question = q;
      replyMessage.text('Что ' + q + '?');
      ctx.state.stage = STAGE_WAIT_FOR_ANSWER;
    } else {
      replyMessage.text('Что запомнить?');
    }
  } else if (ctx.state.stage === STAGE_WAIT_FOR_ANSWER) {
    // уже знаем вопрос, но не знаем ответ
    ctx.state.answer = q;

    // последний ответ можно удалить отдельной командой
    ctx.state.lastAddedItem = {
      questions: [ctx.state.question],
      answer: ctx.state.answer
    };

    await storage.storeAnswer(userData, ctx.state.question, ctx.state.answer);
    replyMessage.text(ctx.state.question + ' находится ' + ctx.state.answer + ', поняла');
    ctx = await resetState(ctx);
  }

  storage.setState(userData, ctx.state);
  return replyMessage.get();
};

// процесс удаления вопроса
const processDelete = async (ctx, question) => {
  const userData = await storage.getUserData(ctx);
  const data = await storage.getData(userData);
  ctx = await resetState(ctx);
  storage.setState(userData, ctx.state);

  const found = data.filter(item => {
    return item.questions.indexOf(question) != -1;
  });

  // не нашлось
  if (found.length == 0) {
    return ctx.reply('Я не знаю, что ' + question);
  }
  // нашлось, но много
  if (found.length > 1) {
    console.log(found);
    return ctx.reply('Я не уверена что удалять...');
  }

  const isSuccess = await storage.removeQuestion(userData, question);
  if (!isSuccess) {
    return ctx.reply('При удалении что-то пошло не так...');
  }

  return ctx.reply('Забыла, что ' + question);
};

// очищает состояние заполнение ответа на вопрос
const resetState = async ctx => {
  const userData = await storage.getUserData(ctx);
  //ctx.state = await storage.getState(userData);
  ctx.state.stage = STAGE_IDLE;
  ctx.state.question = '';
  ctx.state.answer = '';
  storage.setState(userData, ctx.state);
  return ctx;
};

const verbs = [
  'находится',
  'находятся',
  'лежит',
  'лежат',
  'стоит',
  'стоят',
  'висит',
  'висят',
  'налита',
  'налито',
  'будет',
  'будут',
  'было',
  'был',
  'была'
];
module.exports.verbs = verbs;

// находит глагол в команде
const getVerb = message => {
  return verbs.find(verb => {
    const reg = new RegExp(` ${verb} `);
    return message.match(reg);
  });
};

// убирает глагол из начала в вопросе
const cleanVerb = msg => {
  verbs.forEach(verb => {
    msg = msg.replace(new RegExp(`^${verb} `), '');
  });
  return msg;
};

// убирает лишнее в вопросе
const cleanQuestion = message => {
  let msg = message.replace(/^(Алиса )?(а )?(скажи )?что /, '').replace(/^(а )?(скажи )?где /, '');
  return cleanVerb(msg);
};

// простой конструктор ответа с кнопками
const simpleReply = (ctx, lines, buttons) => {
  const replyMessage = ctx.replyBuilder;
  for (let i in buttons) {
    replyMessage.addButton({ ...ctx.buttonBuilder.text(buttons[i]).get() });
  }
  return replyMessage.text(lines.join('\n'));
};

// команда "что ..."
module.exports.whatIs = async ctx => {
  if (ctx.messsage) ctx.message = ctx.messsage;
  console.log('> whatis: ', ctx.message);
  const userData = await storage.getUserData(ctx);
  const q = cleanQuestion(ctx.message);
  const data = await storage.getData(userData);
  ctx.state = await storage.getState(userData);

  if (data.length == 0) {
    return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  let fuse = new Fuse(data, {
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

    console.log('answer: ', msg);
    ctx.reply(msg);
  } else {
    ctx.reply('Я не знаю');
  }
  return true;
};

// команда "где ...""
module.exports.whereIs = async ctx => {
  if (ctx.messsage) ctx.message = ctx.messsage;
  console.log('> whereis: ', ctx.message);
  const userData = await storage.getUserData(ctx);
  const q = cleanQuestion(ctx.message);
  const data = await storage.getData(userData);
  ctx.state = await storage.getState(userData);

  if (data.length == 0) {
    return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  let fuse = new Fuse(data, {
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
  console.log('> commands');
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

  const reply = simpleReply(ctx, ['Вот примеры разных команд:', buttons.join('\n')], buttons);
  return ctx.reply(reply.get());
};

// команда "запомни ${question} находится ${answer}"
module.exports.remember = async ctx => {
  if (ctx.messsage) ctx.message = ctx.messsage;
  console.log('> full answer: ', ctx.message);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const question = ctx.body.question.replace(/^запомни /, '').replace(/^что /, '');
  const answer = ctx.body.answer;

  await storage.storeAnswer(userData, question, answer);

  // последний ответ можно удалить отдельной командой
  ctx.state.lastAddedItem = {
    questions: [question],
    answer: answer
  };

  ctx = await resetState(ctx);
  const suffix = getVerb(ctx.message);
  return ctx.reply(question + ' ' + suffix + ' ' + answer + ', поняла');
};

// команда "забудь всё"
module.exports.clearData = async ctx => {
  console.log('> clear');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  await storage.clearData(userData);
  ctx = await resetState(ctx);
  return ctx.reply('Всё забыла...');
};

// команда "демо данные"
module.exports.demoData = async ctx => {
  console.log('> demo data');
  const userData = await storage.getUserData(ctx);
  await storage.fillDemoData(userData);
  ctx = await resetState(ctx);
  return ctx.reply('Данные сброшены на демонстрационные');
};

// команда "что ты знаешь"
module.exports.known = async ctx => {
  const replyMessage = ctx.replyBuilder;

  // buttons
  const userData = await storage.getUserData(ctx);
  const data = await storage.getData(userData);
  let questions = data.map(item => item.questions[0]);
  const buttons = questions.map(question => 'что ' + question);

  // text
  let text = [];
  if (questions.length > 0) {
    text.push('У меня есть информация об этих объектах:\n');
    text.push(questions.join('\n'));
  } else {
    text.push('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  return ctx.reply(simpleReply(ctx, text, buttons).get());
};

// команда по умолчанию (справка)
module.exports.welcome = async ctx => {
  console.log('> welcome');
  const reply = simpleReply(
    ctx,
    [
      'Я умею запоминать, что где находится или что когда будет и напоминать об этом.',
      'Скажите "запомни", чтобы добавить новый ответ.',
      'Можно быстро добавить новый ответ так: "запомни [что-то] находится [где-то]".',
      'Начните фразу со "что", чтобы получить ответ. Например: "что на дворе".',
      'Начните фразу с "где", чтобы найти место, где это что-то лежит. Например: "где трава".',
      'Можно удалить последний ответ, сказав "удали последнее".',
      'Если надо удалить что-то другое, скажите что, например, "удали на дворе".',
      'Чтобы посмотреть примеры разных команд, скажите "команды".',
      'Если хотите узнать подробности, скажите "помощь".'
    ],
    ['помощь', 'что ты знаешь', 'команды']
  );
  return ctx.reply(reply.get());
};

// команда помощь: "запоминать"
module.exports.helpRemember = async ctx => {
  const buttons = ['запомни на дворе находится трава', 'в среду будет дождь'];
  const reply = simpleReply(
    ctx,
    [
      'Скажите "запомни", чтобы добавить новый ответ пошагово.',
      'Вы можете запоминать вопросы со смыслом "что где" и "что когда".',
      'Можно быстро добавить новый ответ так: "запомни [что-то] находится [где-то]".',
      'Необязательно говорить "запомни" в начале, скорее всего, я вас пойму и так.',
      'Примеры:',
      buttons.join('\n')
    ],
    buttons
  );
  return ctx.reply(reply.get());
};

// команда помощь: "отвечать что"
module.exports.helpWhatis = async ctx => {
  const buttons = ['что на дворе', 'что в среду в столовой', 'что на ужин'];
  const reply = simpleReply(
    ctx,
    [
      'Начните фразу со "что", чтобы получить ответ. Например: "что на дворе".',
      'Вы можете задавать вопросы со смыслом "что где" и "что когда". Например:',
      buttons.join('\n')
    ],
    buttons
  );
  return ctx.reply(reply.get());
};

// команда помощь: "отвечать где"
module.exports.helpWhereis = async ctx => {
  const buttons = ['где трава', 'где находится трава'];
  const reply = simpleReply(
    ctx,
    [
      'Начните фразу с "где", чтобы найти место, где это что-то лежит.',
      'Примеры:',
      buttons.join('\n')
    ],
    buttons
  );
  return ctx.reply(reply.get());
};

// команда помощь: "забывать"
module.exports.helpForget = async ctx => {
  const buttons = ['удали последнее', 'удали на дворе', 'забудь все'];
  const reply = simpleReply(
    ctx,
    [
      'Можно удалить последний ответ, сказав "удали последнее".',
      'Если надо удалить что-то другое, скажите что, например, "удали на дворе".',
      'Если надо очистить память, скажите: "забудь все".'
    ],
    buttons
  );
  return ctx.reply(reply.get());
};

// команда "помощь"
module.exports.help = async ctx => {
  console.log('> help');
  let buttons = ['запоминать', 'отвечать что', 'отвечать где', 'забывать'];
  const reply = simpleReply(
    ctx,
    ['Я умею ' + buttons.join(', ') + '. Что из этого вы хотите знать?'],
    [...buttons, ...['что ты знаешь', 'команды']]
  );
  return ctx.reply(reply.get());
};

// команда "отмена"
module.exports.cancel = async ctx => {
  console.log('> cancel');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  ctx = await resetState(ctx);
  return ctx.reply('Всё отменено');
};

// команда "пока"
module.exports.sessionEnd = async ctx => {
  console.log('> end');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
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
  console.log('> delete last');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  if (!ctx.state.lastAddedItem) {
    return ctx.reply('Я ничего не запоминала в последнее время...');
  }
  const question = ctx.state.lastAddedItem.questions[0];
  return processDelete(ctx, question);
};

// команда "удали ..."
module.exports.deleteQuestion = async ctx => {
  console.log('> delete question');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const question = ctx.body.question;
  return processDelete(ctx, question);
};

// команда "запомни"
module.exports.inAnswerEnter = async ctx => {
  if (ctx.messsage) ctx.message = ctx.messsage;
  console.log('> answer begin: ', ctx.message);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const reply = await processAnswer(ctx, userData);
  return ctx.reply(reply);
};

// процесс заполнение вопроса в сцене in-answer
module.exports.inAnswerProcess = async ctx => {
  if (ctx.messsage) ctx.message = ctx.messsage;
  console.log('> answer end: ', ctx.message);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const reply = await processAnswer(ctx, userData);
  if (ctx.state.stage == STAGE_IDLE) {
    ctx.session.setData('currentScene', null);
  }
  return ctx.reply(reply);
};

// команда рандомного ответа
module.exports.replyRandom = messages => {
  return async ctx => {
    const randomKey = Math.floor(Math.random() * messages.length);
    return ctx.reply(messages[randomKey]);
  };
};
