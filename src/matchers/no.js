module.exports = () => ctx => {
  return ctx.message.match(
    /^(не|да не|конечно не|зачем|нафиг|потом|отмена|отбой|стоп|отстань|отвали|нах|иди)/i
  );
};