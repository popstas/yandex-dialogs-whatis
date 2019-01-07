const storage = require('../storage');

// прописывает данные в контекст
module.exports = () => async (ctx, next) => {
  try {
    ctx.userData = await storage.getUserData(ctx);
    ctx.user = {
      data: await storage.getData(ctx.userData),
      state: await storage.getState(ctx.userData)
    };
  } catch (e) {
    ctx.user = {
      data: {},
      state: { error: 'database' }
    };
  }
  return next(ctx);
};
