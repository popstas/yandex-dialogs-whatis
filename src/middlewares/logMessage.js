// логирует реплику
module.exports = () => (ctx, next) => {
  ctx.logMessage = message => {
    const sessId = ctx.session.id ? ctx.session.id.toString().substring(0, 4) : '';
    console.log(
      `[${sessId}][${ctx.user.state.visitor.visits}][${ctx.user.state.visit.messages}] ${message}`
    );
  };
  return next(ctx);
};
