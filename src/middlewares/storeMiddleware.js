const storage = require('../storage');

module.exports = () => {
  return async ctx => {
    ctx.userData = await storage.getUserData(ctx);
    ctx.user = {
      data: await storage.getData(ctx.userData),
      state: await storage.getState(ctx.userData)
    };
    return ctx;
  };
};
