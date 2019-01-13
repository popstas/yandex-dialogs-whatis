# Сборка yandex-dialogs-sdk из master

В package.json:

```
    "yandex-dialogs-sdk": "fletcherist/yandex-dialogs-sdk"
```

В терминале:

```
cd node_modules/ && git clone https://github.com/fletcherist/yandex-dialogs-sdk.git && cd yandex-dialogs-sdk && npm i && npm run test && npm run build && run run dev
```

## Разворачивание с mongodb

1. Раскомментировать в docker-compose.yml сервис "mongo", задать логин и пароль в файле .env (скорировать из .env.sample)
2. docker-compose up -d
3. Зайти в монгу: `docker-compose exec mongo bash`
4. Зайти в mongo shell, залогиниться админом: и создать юзера в монге:

```
mongo --port 27017
# in mongo shell
db.auth({user: 'yandex-dialogs-whatis', pwd: 'mypassword'})
use yandex-dialogs-whatis
db.createUser({ user: 'yandex-dialogs-whatis', pwd: 'mypassword', roles: [ { role: 'readWrite', db: 'yandex-dialogs-whatis' } ] })
```

## Команды

В `commands` лежат команды:

``` js
module.exports = {
  intent: 'thankyou',
  matcher: ['спс', 'спасибо', 'благодарю'],

  handler(ctx) {
    return ctx.replyRandom([
      'Всегда пожалуйста',
      'Не за что',
      'Обращайся!',
      'Пожалуйста',
    ]);
  }
};
```

Если задан intent, будет вызван код установки интента в chatbase и в лог.
