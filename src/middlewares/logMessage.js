// логирует реплику

module.exports = () => (ctx, next) => {
  ctx.logMessage = message => {
    const sessId = ctx.session.id ? ctx.session.id.toString().substring(0, 4) : '';

    /* if(ctx.user.state.visitor.visits > 10){
      console.log(
        `[${ctx.data.session.message_id}][${ctx.data.session.new}}]`
      );
    } */

    let ageText = '__:__';
    const pad = d => (d > 9 ? d : '0' + d);
    if (ctx.user.state.visitor && ctx.user.state.visitor.lastVisitDate) {
      const age = new Date(new Date().getTime() - ctx.user.state.visitor.lastVisitDate);
      ageText = `${pad(age.getMinutes())}:${pad(age.getSeconds())}`;
    }

    const [visits, messages] = [
      (ctx.user.state.visitor && ctx.user.state.visitor.visits) || 0,
      (ctx.user.state.visit && ctx.user.state.visit.messages) || 0
    ];

    console.log(`${sessId}, ${visits}, ${messages}, ${ageText} ${message}`);
  };
  return next(ctx);
};
