// логирует реплику
module.exports = () => (ctx, next) => {
  ctx.logMessage = message => {
    const sessId = ctx.session.id ? ctx.session.id.toString().substring(0, 4) : '';
    console.log(`[${sessId}] ${message}`);
  };
  return next(ctx);
};
