<a name="1.0.1"></a>
## [1.0.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.0.0...v1.0.1) (2018-07-07)


### Bug Fixes

* не работала команда "отмена" вне сцены in-answer ([87c9fcb](https://github.com/popstas/yandex-dialogs-whatis/commit/87c9fcb))
* не работала команда "пока" ([1a219ea](https://github.com/popstas/yandex-dialogs-whatis/commit/1a219ea))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/popstas/yandex-dialogs-whatis/compare/8cf6ca0...v1.0.0) (2018-07-07)


### Bug Fixes

* ctx.messsage in yandex-dialogs-sdk (3 буквы s) ([ca2494a](https://github.com/popstas/yandex-dialogs-whatis/commit/ca2494a))
* docker-compose: DB_DRIVER=mongo, mount config.js ([b2ab9bc](https://github.com/popstas/yandex-dialogs-whatis/commit/b2ab9bc))
* get DB_DRIVER from config ([d7b70ac](https://github.com/popstas/yandex-dialogs-whatis/commit/d7b70ac))
* getState иногда не срабатывал ([e50db78](https://github.com/popstas/yandex-dialogs-whatis/commit/e50db78))
* switch to popstas/yandex-dialogs-sdk fork ([27faf65](https://github.com/popstas/yandex-dialogs-whatis/commit/27faf65))
* try to remove express from lambda ([df0d72b](https://github.com/popstas/yandex-dialogs-whatis/commit/df0d72b))
* update mongodb data don't set questions field ([5f8b472](https://github.com/popstas/yandex-dialogs-whatis/commit/5f8b472))
* update to yandex-dialogs-sdk 1.2.1 ([b3d8232](https://github.com/popstas/yandex-dialogs-whatis/commit/b3d8232))
* update yandex-dialogs-sdk to 1.2.1 ([a894118](https://github.com/popstas/yandex-dialogs-whatis/commit/a894118))
* возвращение с popstas/yandex-dialogs-sdk на yandex-dialogs-sdk 1.1.9 ([6dbe8b6](https://github.com/popstas/yandex-dialogs-whatis/commit/6dbe8b6))
* восстановлена работа "запомни" на stateful сервере ([88fe453](https://github.com/popstas/yandex-dialogs-whatis/commit/88fe453))
* магические цифры в настройках fuse ([de596ff](https://github.com/popstas/yandex-dialogs-whatis/commit/de596ff))
* ответ на неизвестный вопрос, более строгий поиск ([c5ac8d0](https://github.com/popstas/yandex-dialogs-whatis/commit/c5ac8d0))
* поиск строчных команд был сломан ([6555520](https://github.com/popstas/yandex-dialogs-whatis/commit/6555520))
* поправленные сломанные утром фичи "запомни", "удали последнее" ([29c7942](https://github.com/popstas/yandex-dialogs-whatis/commit/29c7942))
* поправлены кнопки в помощи ([79416c1](https://github.com/popstas/yandex-dialogs-whatis/commit/79416c1))
* текст помощи и кнопки команд актуализированы ([e2972bb](https://github.com/popstas/yandex-dialogs-whatis/commit/e2972bb))
* улучшена помощь при неправильном вводе ([c63c9c4](https://github.com/popstas/yandex-dialogs-whatis/commit/c63c9c4))


### Features

* answer with demo data ([8cf6ca0](https://github.com/popstas/yandex-dialogs-whatis/commit/8cf6ca0))
* aws lambda deploy ([db4619e](https://github.com/popstas/yandex-dialogs-whatis/commit/db4619e))
* claudia -> serverless- Были переписаны места по работе с mongo, так, чтобы подключение происходило в момент запроса, а не на старте приложения- getUserData сделан с promise- вместо alice.listen() теперь используется express из handlerExpress() ([3e320e4](https://github.com/popstas/yandex-dialogs-whatis/commit/3e320e4))
* mongodb driver ([b08b5ba](https://github.com/popstas/yandex-dialogs-whatis/commit/b08b5ba))
* store answers ([5b4310f](https://github.com/popstas/yandex-dialogs-whatis/commit/5b4310f))
* вариант "а что ..." ([475f4c8](https://github.com/popstas/yandex-dialogs-whatis/commit/475f4c8))
* вариант "запомни что" ([a342ea3](https://github.com/popstas/yandex-dialogs-whatis/commit/a342ea3))
* варианты типа "что лежит (стоит, находится) ..." ([b8d63f5](https://github.com/popstas/yandex-dialogs-whatis/commit/b8d63f5))
* выделены глаголы типа "находится", "стоит", поддержка в вопросах и ответах ([8622c82](https://github.com/popstas/yandex-dialogs-whatis/commit/8622c82))
* запоминание без "запомни" ([8c20b8e](https://github.com/popstas/yandex-dialogs-whatis/commit/8c20b8e))
* иконка, чеклист на подготовку к публикации ([913ca1d](https://github.com/popstas/yandex-dialogs-whatis/commit/913ca1d)), closes [#1](https://github.com/popstas/yandex-dialogs-whatis/issues/1)
* команда "где", поиск по ответу ([20a7013](https://github.com/popstas/yandex-dialogs-whatis/commit/20a7013))
* команда "демо данные" оставлена только для тестов ([2c2210d](https://github.com/popstas/yandex-dialogs-whatis/commit/2c2210d))
* команда "пока" ([60e7d85](https://github.com/popstas/yandex-dialogs-whatis/commit/60e7d85))
* команда "что ты умеешь" ([79f3e03](https://github.com/popstas/yandex-dialogs-whatis/commit/79f3e03))
* команда по умолчанию разделена на "что ты знаешь", "помощь" и "" ([8369c22](https://github.com/popstas/yandex-dialogs-whatis/commit/8369c22))
* команды "забудь всё", "команды" ([104b4ba](https://github.com/popstas/yandex-dialogs-whatis/commit/104b4ba))
* множественные числа и склонения глаголов ([533e0f9](https://github.com/popstas/yandex-dialogs-whatis/commit/533e0f9))
* находится можно использовать в варианте "находятся" ([b495be4](https://github.com/popstas/yandex-dialogs-whatis/commit/b495be4))
* отлично, прекрасно, круто ([e266189](https://github.com/popstas/yandex-dialogs-whatis/commit/e266189))
* поддержка обращения Алиса ([80f9f5f](https://github.com/popstas/yandex-dialogs-whatis/commit/80f9f5f))
* подробная помощь по командам и короткое приветствие ([ed1ed49](https://github.com/popstas/yandex-dialogs-whatis/commit/ed1ed49))
* скажи ..., ответ на похвалы ([d78a97d](https://github.com/popstas/yandex-dialogs-whatis/commit/d78a97d))
* спасибо-пожалуйста ([9c33c69](https://github.com/popstas/yandex-dialogs-whatis/commit/9c33c69))
* сценарии для тестирования на /scenarios.yml ([bdf6fd9](https://github.com/popstas/yandex-dialogs-whatis/commit/bdf6fd9))
* удаление последнего, удаление конкретного ([dd140bd](https://github.com/popstas/yandex-dialogs-whatis/commit/dd140bd))
* хранение состояния юзера в mongodb ([a6e1ee6](https://github.com/popstas/yandex-dialogs-whatis/commit/a6e1ee6))



