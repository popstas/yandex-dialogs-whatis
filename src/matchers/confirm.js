module.exports = () => ctx => {
  return ctx.session.getData('confirm');
};
