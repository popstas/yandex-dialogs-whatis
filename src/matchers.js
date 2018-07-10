module.exports.strings = vals => {
  return ctx => {
    if (typeof vals === 'string') return ctx.message === vals;
    if (Array.isArray(vals)) return vals.indexOf(ctx.message) != -1;
    return false;
  };
};
