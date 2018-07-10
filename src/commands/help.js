const storage = require('../storage');
const helpers = require('../helpers');

// команда по умолчанию (справка)
module.exports.welcome = async ctx => {
  console.log(`> ${ctx.message} (welcome)`);
  let msg;
  if (ctx.user.state.lastWelcome) {
    const last = new Date(ctx.user.state.lastWelcome);
    const lastLong = new Date().getTime() - last > 12 * 3600 * 1000;
    msg = ['Привет' + (lastLong ? ', давно не виделись' : '')];
  } else {
    msg = [
      'Я умею запоминать, что где находится или что когда будет и напоминать об этом.',
      'Скажите "запомни", чтобы добавить новый ответ.',
      'Можно быстро добавить новый ответ так: "запомни [что-то] находится [где-то]".',
      'Начните фразу со "что", чтобы получить ответ. Например: "что на дворе".',
      'Начните фразу с "где", чтобы найти место, где это что-то лежит. Например: "где трава".',
      'Можно удалить последний ответ, сказав "удали последнее".',
      'Если надо удалить что-то другое, скажите что, например, "удали на дворе".',
      'Чтобы посмотреть примеры разных команд, скажите "команды".',
      'Если хотите узнать подробности, скажите "помощь".'
    ];
  }

  // store last welcome
  ctx.user.state.lastWelcome = new Date().getTime();
  storage.setState(ctx.userData, ctx.user.state);

  const reply = helpers.simpleReply(ctx, msg, ['помощь', 'что ты знаешь', 'команды']);
  return ctx.reply(reply.get());
};

// команда "помощь"
module.exports.help = async ctx => {
  console.log(`> ${ctx.message} (help)`);
  let buttons = ['запоминать', 'отвечать что', 'отвечать где', 'забывать'];
  const reply = helpers.simpleReply(
    ctx,
    ['Я умею ' + buttons.join(', ') + '. Что из этого вы хотите знать?'],
    [...buttons, ...['что ты знаешь', 'команды']]
  );
  return ctx.reply(reply.get());
};

// команда помощь: "запоминать"
module.exports.remember = async ctx => {
  console.log(`> ${ctx.message} (remember)`);
  const buttons = ['запомни на дворе находится трава', 'в среду будет дождь'];
  const reply = helpers.simpleReply(
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
module.exports.whatis = async ctx => {
  console.log(`> ${ctx.message} (whatis)`);
  const buttons = ['что на дворе', 'что в среду в столовой', 'что на ужин'];
  const reply = helpers.simpleReply(
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
module.exports.whereis = async ctx => {
  console.log(`> ${ctx.message} (whereis)`);
  const buttons = ['где трава', 'где находится трава'];
  const reply = helpers.simpleReply(
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
module.exports.forget = async ctx => {
  console.log(`> ${ctx.message} (forget)`);
  const buttons = ['удали последнее', 'удали на дворе', 'забудь все'];
  const reply = helpers.simpleReply(
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
