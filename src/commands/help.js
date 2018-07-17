const storage = require('../storage');
const commands = require('../commands');
const utils = require('../utils');

// команда по умолчанию (справка)
module.exports.welcome = async ctx => {
  if (ctx.message != 'ping') console.log(`> ${ctx.message} (welcome)`);
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
      'Чтобы всё стало понятно, посмотрите примеры использования, скажите "примеры".',
      'Если хотите узнать подробности команд, скажите "помощь".'
    ];
  }

  // store last welcome
  ctx.user.state.lastWelcome = new Date().getTime();
  storage.setState(ctx.userData, ctx.user.state);

  return ctx.replySimple(msg, ['помощь', 'примеры', 'что ты знаешь', 'команды']);
};

// нераспознанная команда
module.exports.any = async ctx => {
  console.log(`> ${ctx.message} (any)`);
  // определение частей фразы без глагола
  const cleanMsg = ctx.message.replace(/^запомни /, '').replace(/^что /, '');
  const posts = utils.getMsgPosts(cleanMsg);
  const words = cleanMsg.split(' ');
  prepIndex = posts.indexOf('PREP');
  if (prepIndex != -1) {
    const question = words.slice(prepIndex, prepIndex + 2);
    const answer = prepIndex === 0 ? words.slice(prepIndex + 2) : words.slice(0, prepIndex);
    const possibleMsg = question.join(' ') + ' находится ' + answer.join(' ');
    console.log(`< ${possibleMsg}?`);
    return ctx.confirm(
      possibleMsg + '?',
      ctx => commands.processRemember(ctx, possibleMsg),
      ctx =>
        ctx.replyRandom([
          'Я такое не понимаю...',
          'Ну тогда не знаю... Попробуйте добавить глагол, так я лучше понимаю',
          'Если вы правда имели в виду что что-то где-то находится, я это скоро пойму... Заходите через недельку'
        ])
    );
  }

  if (ctx.message.match(/(вчера|завтра|сегодня)/) || ctx.message.match(/^запомни /)) {
    return ctx.replySimple('Вам нужно добавить глагол, например, запомни что завтра будет завтра', [
      'как запомнить',
      'примеры'
    ]);
  }

  const messages = [
    'Не поняла',
    'О чём вы?',
    'Может вам нужна помощь? Скажите "помощь"',
    'Похоже, мы друг друга не понимаем, скажите "примеры"'
  ];
  const randomKey = Math.floor(Math.random() * messages.length);
  return ctx.replySimple(messages[randomKey], ['помощь', 'примеры']);
};

// команда "сценарии"
module.exports.scanarios = async ctx => {
  const msg = ctx.message;
  const scenarios = {
    'виртуальные подписи': [
      'Изначально задумка навыка была такая: имеются разноцветные бутылочки без подписей, в которых меняется жидкость.',
      'Вторая память в этом случае заменяет подписи на бутылочках, при замене жидкости говорится: "в красном налит арбуз". Потом можно узнавать: "где арбуз" или "что в красном".'
    ],
    'помощь мастеру': [
      'Если вам приходилось когда-нибудь разбирать технику или собирать девайсы на платформах типа Ардуино или ESP, вы знаете, что собрать обратно бывает непросто, если не запоминать процесс разборки.',
      '',
      'Навык может помочь в простых случаях (в сложных проще сделать фотографии до разборки). Например, можно запоминать соответствия "пин - цвет": "в первом воткнут синий", а потом спросить при сборке: "где синий".'
    ],
    'список покупок': [
      'Этот сценарий не проработан, для него лучше использовать навык "Мой список покупок", но в принципе он сработает и в чем-то он более человечно сработает.',
      '',
      'Главное условие: все продукты надо проговорить за один раз, например: "в магазине надо купить яйца, хлеб, молоко и кефир". Спросить можно так: "что в магазине".'
    ],
    расписание: [
      'Это может быть расписание пар в школе или меню в столовой.',
      '"в среду в школе будет математика, русский, черчение, физика" - "что будет в среду в школе",',
      '"в пятницу в столовой будут щи" - "что будет в пятницу в столовой".'
    ],
    'показания счетчиков': [
      'Если вы передаёте показания счетчиков электричества или воды, вы знаете, что нужно либо запомнить несколько цифр, либо подходить с листочком.',
      'Со второй памятью это можно сделать так: "тариф 1 набежало 2568", спросить: "что тариф 1", "холодная натекло 321", спросить: "что холодная".'
    ],
    'запомни номер': [
      'Бывают ситуации, когда надо записать номер телефона. Через навык можно сделать это так: "Запомни Алексей набрать 8 9 2 2 2 2 2 2 2 2 2", спросить "кто Алексей".'
    ]
  };
  const names = Object.keys(scenarios);

  const scenario = scenarios[msg];
  if (scenario) return ctx.replySimple(scenario, names);

  return ctx.replySimple(
    [
      'Примеры сценариев использования второй памяти, назовите сценарий, чтобы узнать подробности:',
      names.join('\n')
    ],
    names
  );
};

// команда "помощь"
module.exports.help = async ctx => {
  if (ctx.message != 'ping') console.log(`> ${ctx.message} (help)`);
  return ctx.replySimple(
    'Я умею запоминать, отвечать что, отвечать где или забывать. Что из этого вы хотите знать?',
    ['запоминать', 'отвечать что', 'отвечать где', 'забывать', 'что ты знаешь', 'примеры']
  );
};

// команда помощь: "запоминать"
module.exports.remember = async ctx => {
  console.log(`> ${ctx.message} (remember)`);
  const buttons = ['запомни на дворе находится трава', 'в среду будет дождь'];
  return ctx.replySimple(
    [
      'Скажите "запомни", чтобы добавить новый ответ пошагово.',
      'Вы можете запоминать вопросы со смыслом "что где" и "что когда".',
      'Можно быстро добавить новый ответ так: "запомни [что-то] находится [где-то]".',
      'Между вопросом и ответом обязательно должен быть глагол.',
      'Необязательно говорить "запомни" в начале, скорее всего, я вас пойму и так.',
      'Примеры:',
      buttons.join('\n')
    ],
    buttons
  );
};

// команда помощь: "отвечать что"
module.exports.whatis = async ctx => {
  console.log(`> ${ctx.message} (whatis)`);
  const buttons = ['что на дворе', 'что в среду в столовой', 'что на ужин'];
  return ctx.replySimple(
    [
      'Начните фразу со "что", чтобы получить ответ. Например: "что на дворе".',
      'Вы можете задавать вопросы со смыслом "что где" и "что когда". Например:',
      buttons.join('\n')
    ],
    buttons
  );
};

// команда помощь: "отвечать где"
module.exports.whereis = async ctx => {
  console.log(`> ${ctx.message} (whereis)`);
  const buttons = ['где трава', 'где находится трава'];
  return ctx.replySimple(
    [
      'Начните фразу с "где", чтобы найти место, где это что-то лежит.',
      'Примеры:',
      buttons.join('\n')
    ],
    buttons
  );
};

// команда помощь: "забывать"
module.exports.forget = async ctx => {
  console.log(`> ${ctx.message} (forget)`);
  const buttons = ['удали последнее', 'удали на дворе', 'забудь все'];
  return ctx.replySimple(
    [
      'Можно удалить последний ответ, сказав "удали последнее".',
      'Если надо удалить что-то другое, скажите что, например, "удали на дворе".',
      'Если надо очистить память, скажите: "забудь все".'
    ],
    buttons
  );
};
