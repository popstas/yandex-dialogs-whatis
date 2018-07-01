'use strict';
const storage = require('./storage');
const Fuse = require('fuse.js');

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
    ctx.reply('Я не понимаю');
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
  ctx.reply(replyMessage.get());
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
  ctx.reply('Данные сброшены на демонстрационные');
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
