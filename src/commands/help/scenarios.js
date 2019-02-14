module.exports = {
  intent: 'helpScenarios',
  matcher: [
    ...['сценарии', 'примеры', 'пример', 'еще примеры', 'примеры использования', 'правила'],
    ...[
      'покупки',
      'виртуальные подписи',
      'помощь мастеру',
      'расписание',
      'расписания',
      'показания счетчиков',
      'показания счетчика'
    ]
  ],

  async handler(ctx) {
    const msg = ctx.message;
    const scenarios = {
      покупки: [
        'Примеры использвания списка покупок: ',
        [
          'добавь в список сыр и масло',
          'еще надо купить сметану',
          'что в списке',
          'удали сметану из списка',
          'плюс мандарины минус бананы плюс шоколад'
        ].join(',\n')
      ],
      'виртуальные подписи': [
        'Изначально задумка навыка была такая: имеются разноцветные бутылочки без подписей, в которых меняется жидкость.',
        'Вторая память в этом случае заменяет подписи на бутылочках, при замене жидкости говорится: "в красном налит арбуз". Потом можно узнавать: "где арбуз" или "что в красном".'
      ],
      'помощь мастеру': [
        'Если вам приходилось когда-нибудь разбирать технику или собирать девайсы на платформах типа Ардуино с использованием разноцветных проводков, вы знаете, что собрать обратно бывает непросто, если не запоминать процесс разборки.',
        '',
        'Навык может помочь в простых случаях (в сложных проще сделать фотографии до разборки). Например, можно запоминать соответствия "пин - цвет": "в первом воткнут синий", а потом спросить при сборке: "где синий".'
      ],
      расписание: [
        'Это может быть расписание пар в школе или меню в столовой.',
        '"в среду в школе будет математика, русский, черчение, физика" - "что будет в среду в школе",',
        '"в пятницу в столовой будут щи" - "что будет в пятницу в столовой".'
      ],
      'показания счетчиков': [
        'Если вы передаёте показания счетчиков электричества или воды, вы знаете, что нужно либо запомнить несколько цифр, либо подходить с листочком.',
        'Со второй памятью это можно сделать так: "тариф 1 набежало 2568", спросить: "что тариф 1", "холодная натекло 321", спросить: "что холодная".'
      ]
    };
    const names = Object.keys(scenarios);

    const scenario = scenarios[msg];
    if (scenario) return ctx.reply(scenario, names);

    return ctx.replyRandom(
      [
        'Примеры сценариев использования второй памяти, назовите сценарий, чтобы узнать подробности:\n' +
          names.join(',\n'),
        'Примеры сценариев, назовите сценарий, чтобы узнать подробности:\n' + names.join(',\n')
      ],
      names
    );
  }
};
