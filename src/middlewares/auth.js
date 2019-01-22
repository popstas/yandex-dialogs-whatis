const matchers = require('../matchers');

module.exports = () => (ctx, next) => {
  ctx.auth = async options => {
    if (ctx.meta.interfaces.includes('screen')) {
      return await ctx.reply(
        'Авторизуйтесь по этой ссылке: https://auth.dialogs.popstas.ru/token?user_id=' + ctx.userId
      );
    } else {
      return await ctx.reply(
        'Сначала войдите через устройство с экраном, после этого скажите мне код'
      );
    }
  };

  /* const match = matchers.strings([
    'авторизация через google',
    'подключи яндекс аккаунт',
    'авторизуй через яндекс',
    'яндекс',
    'авторизация',
    'вход',
    'войти',
    'регистрация',
    'войти через яндекс',
    'вход через яндекс',
    'войти через гугл аккаунт',
    'срисовать google аккаунта',
    'спешишь гитхаб профиля профиля',
    'авторизуй меня через гугл',
    'свяжись со станции',
    'заверши телефон станции'
  ])(ctx);

  if (match) return ctx.auth({}); */

  return next(ctx);
};
