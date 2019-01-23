// логирует реплику
module.exports = () => (ctx, next) => {
  ctx.logMessage = message => {
    const sessId = ctx.session.id ? ctx.session.id.toString().substring(0, 4) : '';

    if(ctx.user.state.visitor.visits > 10){
      console.log(
        `[${ctx.data.session.message_id}][${ctx.data.session.new}}]`
      );
    }

    console.log(
      `[${sessId}][${ctx.user.state.visitor.visits}][${ctx.user.state.visit.messages}] ${message}`
    );
  };
  return next(ctx);
};
