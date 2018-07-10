// здесь мелкие обработки текста

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
module.exports.getVerb = message => {
  return verbs.find(verb => {
    const reg = new RegExp(`${verb} `);
    return message.match(reg);
  }) || false;
};

// убирает глагол из начала в вопросе
const cleanVerb = msg => {
  verbs.forEach(verb => {
    msg = msg.replace(new RegExp(`^${verb} `), '');
    msg = msg.replace(new RegExp(` ${verb}$`), '');
  });
  return msg;
};
// module.exports.cleanVerb = cleanVerb;

// убирает лишнее в вопросе
module.exports.cleanQuestion = message => {
  let msg = message
    .replace(/^(Алиса )?(привет )?(а )?(скажи )?что /, '')
    .replace(/^(Алиса )?(привет )?(а )?(скажи )?где /, '');
  return cleanVerb(msg);
};
