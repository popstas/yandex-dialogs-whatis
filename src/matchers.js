const utils = require('./utils');

module.exports.strings = vals => {
  return ctx => {
    if (typeof vals === 'string') return ctx.message.toLowerCase() === vals;
    if (Array.isArray(vals)) return vals.indexOf(ctx.message.toLowerCase()) != -1;
    return false;
  };
};

// фраза с глаголом посередине
module.exports.rememberSentence = () => {
  return ctx => {
    if (ctx.session.getData('currentScene') === 'in-answer') {
      ctx.message = ctx.message.replace(/^что /, '');
    }
    if (ctx.message.match(/^(что|кто) /)) return false;
    if (ctx.message.match(/^(где|когда|в чем) /)) return false;
    if (ctx.message.match(/^(как|зачем|почему) /)) return false;
    return utils.splitByVerb(ctx.message.replace(/^запомни /, ''));
  };
};
