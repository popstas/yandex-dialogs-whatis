module.exports.strings = vals => {
  return ctx => {
    if (typeof vals === 'string') return ctx.message.toLowerCase() === vals;
    if (Array.isArray(vals)) return vals.indexOf(ctx.message.toLowerCase()) != -1;
    return false;
  };
};
