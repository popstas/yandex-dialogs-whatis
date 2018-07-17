const utils = require('../utils');

// фраза с глаголом посередине
module.exports = () => ctx => {
  if (ctx.session.getData('currentScene') === 'in-answer') {
    ctx.message = ctx.message.replace(/^что /, '');
  }
  if (ctx.message.match(/^(что|кто) /)) return false;
  if (ctx.message.match(/^(где|когда|в чем) /)) return false;
  if (ctx.message.match(/^(как|зачем|почему) /)) return false;
  return utils.splitByVerb(ctx.message.replace(/^запомни /, ''));
};
