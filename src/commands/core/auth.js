// вход через яндекс аккаунт
module.exports = {
  disabled: true,
  intent: 'auth',
  matcher: [
    // вход через аккаунт
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
    'заверши телефон станции',

    // вход через код
    'через гитхаб',
    'авторизация через hope',
    'авторизация через код',
    'повтори',
    'авторизация через код',
    '3 6 1 5 2 9',
    'кот',
    'пин код 9 6 4 1 8 3',
    'ввести код 9 8 7 6 5 4',
    'код авторизации 1 2 3 4 5 6',
    'войти через пинкод'
  ],

  async handler(ctx) {
    return ctx.auth();
  }
};