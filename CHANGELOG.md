## [3.5.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.5.0...v3.5.1) (2019-01-31)


### Bug Fixes

* axios package ([1f69e83](https://github.com/popstas/yandex-dialogs-whatis/commit/1f69e83))



# [3.5.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.9...v3.5.0) (2019-01-31)


### Features

* кастомные вебхуки ([e44fe06](https://github.com/popstas/yandex-dialogs-whatis/commit/e44fe06))



## [3.4.9](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.8...v3.4.9) (2019-01-31)


### Features

* команда "посещаемость", визиты за сегодня и вчера ([230120a](https://github.com/popstas/yandex-dialogs-whatis/commit/230120a))



## [3.4.8](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.7...v3.4.8) (2019-01-30)


### Features

* кнопки удаления продуктов в списке, +- знаками ([25f0a84](https://github.com/popstas/yandex-dialogs-whatis/commit/25f0a84))



## [3.4.7](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.6...v3.4.7) (2019-01-29)


### Features

* "удали это" после shopList ([2e4aba6](https://github.com/popstas/yandex-dialogs-whatis/commit/2e4aba6))



## [3.4.6](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.5...v3.4.6) (2019-01-29)


### Bug Fixes

* в список покупок допускаются только существительные ([c050227](https://github.com/popstas/yandex-dialogs-whatis/commit/c050227))



## [3.4.5](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.4...v3.4.5) (2019-01-28)


### Bug Fixes

* корректный ответ при отвале БД ([2e86564](https://github.com/popstas/yandex-dialogs-whatis/commit/2e86564))
* новые слова к старым командам: отмени, хочу, что в песке ([e733b86](https://github.com/popstas/yandex-dialogs-whatis/commit/e733b86))
* тесты снова на loki ([feb5715](https://github.com/popstas/yandex-dialogs-whatis/commit/feb5715))


### Features

* ссылка на Умный счетчик калорий ([2d8a149](https://github.com/popstas/yandex-dialogs-whatis/commit/2d8a149))



## [3.4.4](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.3...v3.4.4) (2019-01-24)


### Bug Fixes

* ответ на просто "как", "зачем" и "почему" ([f5a41dc](https://github.com/popstas/yandex-dialogs-whatis/commit/f5a41dc))
* паузы в перечислениях, помощь "покупки", мелкие правки ([e2f32f1](https://github.com/popstas/yandex-dialogs-whatis/commit/e2f32f1))
* правки примеров ([9d89bb8](https://github.com/popstas/yandex-dialogs-whatis/commit/9d89bb8))



## [3.4.3](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.2...v3.4.3) (2019-01-23)


### Bug Fixes

* проверка ответов от Алисы в session ([0886936](https://github.com/popstas/yandex-dialogs-whatis/commit/0886936))
* улучшение определения "запомни" ([8a8942d](https://github.com/popstas/yandex-dialogs-whatis/commit/8a8942d))


### Features

* завершать сессию, если при запуске навыка передавали команду ([a4695e8](https://github.com/popstas/yandex-dialogs-whatis/commit/a4695e8))



## [3.4.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.1...v3.4.2) (2019-01-23)


### Bug Fixes

* исправлены ошибки несовпадение с командой из-за регистра ([e5ea047](https://github.com/popstas/yandex-dialogs-whatis/commit/e5ea047))
* обработка ошибки на шаге удаления в туре ([99abe4b](https://github.com/popstas/yandex-dialogs-whatis/commit/99abe4b))
* обрезка "Алиса" в конце фразы, cleaner без учета регистра ([9559f3a](https://github.com/popstas/yandex-dialogs-whatis/commit/9559f3a))


### Features

* иногда огрызаться на "да", сказанное без вопроса ([3e6f2ed](https://github.com/popstas/yandex-dialogs-whatis/commit/3e6f2ed))



## [3.4.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.4.0...v3.4.1) (2019-01-22)


### Bug Fixes

* loki storage переписан под shared.auth ([2b04b82](https://github.com/popstas/yandex-dialogs-whatis/commit/2b04b82))
* более длинные паузы в истории изменений ([44fb6bb](https://github.com/popstas/yandex-dialogs-whatis/commit/44fb6bb))
* команда "повтори" теперь полностью повторяет предыдущий ответ ([7251c0d](https://github.com/popstas/yandex-dialogs-whatis/commit/7251c0d))



# [3.4.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.3.2...v3.4.0) (2019-01-22)


### Bug Fixes

* helpAuthCode, отвязка устройства authCodeCancel, changelog ([bc06682](https://github.com/popstas/yandex-dialogs-whatis/commit/bc06682))
* правки генерации и распознавания кода ([829ae73](https://github.com/popstas/yandex-dialogs-whatis/commit/829ae73))
* скажи код, 30 -> 60 сек ([b0d52a3](https://github.com/popstas/yandex-dialogs-whatis/commit/b0d52a3))
* удалить из базы случайно записанный state.error ([e9d97ef](https://github.com/popstas/yandex-dialogs-whatis/commit/e9d97ef))
* улучшено распознавание changelog, sessionEnd ([8d86d90](https://github.com/popstas/yandex-dialogs-whatis/commit/8d86d90))


### Features

* команды связывания устройств по одноразовому коду ([7dea715](https://github.com/popstas/yandex-dialogs-whatis/commit/7dea715))



## [3.3.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.3.1...v3.3.2) (2019-01-20)


### Bug Fixes

* улучшено распознавание команд "версия", "что нового" ([2cfbc3c](https://github.com/popstas/yandex-dialogs-whatis/commit/2cfbc3c))
* **cleaner:** пожалуйста ([9a67013](https://github.com/popstas/yandex-dialogs-whatis/commit/9a67013))


### Features

* команда sendTo (отправь на email), заглушка ([b5e8e14](https://github.com/popstas/yandex-dialogs-whatis/commit/b5e8e14))



## [3.3.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.3.0...v3.3.1) (2019-01-17)


### Features

* команда "что ты услышала" ([76a5f38](https://github.com/popstas/yandex-dialogs-whatis/commit/76a5f38))



# [3.3.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.2.2...v3.3.0) (2019-01-16)


### Bug Fixes

* подробные intents для shopList ([69a0d51](https://github.com/popstas/yandex-dialogs-whatis/commit/69a0d51))


### Features

* голосовые эффекты ([aaf3e5b](https://github.com/popstas/yandex-dialogs-whatis/commit/aaf3e5b))
* исправление ударений ([57a3470](https://github.com/popstas/yandex-dialogs-whatis/commit/57a3470))
* опциональный confirm ([cb37921](https://github.com/popstas/yandex-dialogs-whatis/commit/cb37921))



## [3.2.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.2.1...v3.2.2) (2019-01-16)


### Bug Fixes

* удален сценарий "запомни номер" ([bab70dd](https://github.com/popstas/yandex-dialogs-whatis/commit/bab70dd))


### Features

* команда "повтори" ([cd73386](https://github.com/popstas/yandex-dialogs-whatis/commit/cd73386))
* команда "сколько" (заглушка) ([dfdb8dd](https://github.com/popstas/yandex-dialogs-whatis/commit/dfdb8dd))



## [3.2.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.2.0...v3.2.1) (2019-01-15)


### Bug Fixes

* changelog-bot ([f8acbad](https://github.com/popstas/yandex-dialogs-whatis/commit/f8acbad))
* тогда в начале ([14c632f](https://github.com/popstas/yandex-dialogs-whatis/commit/14c632f))


### Features

* az middleware, списки с "и", понимание пустых списков ([4ddd6d8](https://github.com/popstas/yandex-dialogs-whatis/commit/4ddd6d8))



# [3.2.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.1.1...v3.2.0) (2019-01-14)


### Bug Fixes

* одиночное удаление продукта из списка без уточнения, что это список ([00fba3e](https://github.com/popstas/yandex-dialogs-whatis/commit/00fba3e))
* удали последнее для списка покупок ([9043388](https://github.com/popstas/yandex-dialogs-whatis/commit/9043388))


### Features

* плюс-минус в списке покупок ([78caa65](https://github.com/popstas/yandex-dialogs-whatis/commit/78caa65))



## [3.1.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.1.0...v3.1.1) (2019-01-14)


### Bug Fixes

* забудь всё теперь очищает список покупок ([2b8c4d7](https://github.com/popstas/yandex-dialogs-whatis/commit/2b8c4d7))
* улучшения в ответе списк покупок ([fd43afb](https://github.com/popstas/yandex-dialogs-whatis/commit/fd43afb))
* упоминание списка покупок в "что ты знаешь" ([86e68e1](https://github.com/popstas/yandex-dialogs-whatis/commit/86e68e1))


### Features

* добавление в покупки через "запомни в магазине хлеб и молоко" ([ef7270b](https://github.com/popstas/yandex-dialogs-whatis/commit/ef7270b))



# [3.1.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v3.0.0...v3.1.0) (2019-01-14)


### Features

* список покупок ([b23184d](https://github.com/popstas/yandex-dialogs-whatis/commit/b23184d))



# [3.0.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.4.0...v3.0.0) (2019-01-13)


### Bug Fixes

* changelog не запоминался ([ffd1af4](https://github.com/popstas/yandex-dialogs-whatis/commit/ffd1af4))
* правки текстов в туре ([b19e125](https://github.com/popstas/yandex-dialogs-whatis/commit/b19e125))


### Features

* проговаривание услышанного в tts ([8504534](https://github.com/popstas/yandex-dialogs-whatis/commit/8504534))
* **cleaner:** убирание "то" и "же" ([d31b8c3](https://github.com/popstas/yandex-dialogs-whatis/commit/d31b8c3))



# [2.4.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.3.1...v2.4.0) (2019-01-11)


### Bug Fixes

* confirm не сбрасывался после выхода из навыка ([d2e81cd](https://github.com/popstas/yandex-dialogs-whatis/commit/d2e81cd))
* dockerignore data/ relative ([87dfb56](https://github.com/popstas/yandex-dialogs-whatis/commit/87dfb56))
* научилась лучше понимать команды "удали последнее", "что ты знаешь" ([593d1c5](https://github.com/popstas/yandex-dialogs-whatis/commit/593d1c5))


### Features

* visitor.lastVisitDate ([afafd71](https://github.com/popstas/yandex-dialogs-whatis/commit/afafd71))
* команда "что нового", changelog ([e44bc18](https://github.com/popstas/yandex-dialogs-whatis/commit/e44bc18))



## [2.3.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.3.0...v2.3.1) (2019-01-09)


### Bug Fixes

* версия, правильное произношение ([b34aa3b](https://github.com/popstas/yandex-dialogs-whatis/commit/b34aa3b))


### Features

* версия, запусти навык 2 память ([da323a8](https://github.com/popstas/yandex-dialogs-whatis/commit/da323a8))



# [2.3.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.2.3...v2.3.0) (2019-01-09)


### Bug Fixes

* много мелких исправлений ([04fa747](https://github.com/popstas/yandex-dialogs-whatis/commit/04fa747))



## [2.2.3](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.2.2...v2.2.3) (2019-01-09)


### Bug Fixes

* **chatbase:** разметка агентских сообщений ([c99656e](https://github.com/popstas/yandex-dialogs-whatis/commit/c99656e))
* **yametrika:** не отправлять пустые сообщения ([3d15bfa](https://github.com/popstas/yandex-dialogs-whatis/commit/3d15bfa))



## [2.2.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.2.1...v2.2.2) (2019-01-09)



## [2.2.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.2.0...v2.2.1) (2019-01-09)


### Bug Fixes

* alice.any command была сломана и не тестилась ([818349d](https://github.com/popstas/yandex-dialogs-whatis/commit/818349d))



# [2.2.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.1.2...v2.2.0) (2019-01-09)


### Bug Fixes

* **chatbase:** onShutdown -> sendEvent ([785f9f2](https://github.com/popstas/yandex-dialogs-whatis/commit/785f9f2))
* работа тестов с отключенной отправкой метрик ([0f2b2f9](https://github.com/popstas/yandex-dialogs-whatis/commit/0f2b2f9))


### Features

* **chatbase:** навык размечен с учетом intents, handled messages и остальным, что можно передать в chatbase ([291ad1a](https://github.com/popstas/yandex-dialogs-whatis/commit/291ad1a))



## [2.1.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.1.1...v2.1.2) (2019-01-08)


### Bug Fixes

* chatbase отключен на тестовом ([b5d99ed](https://github.com/popstas/yandex-dialogs-whatis/commit/b5d99ed))


### Features

* chatbase аналитика ([224a138](https://github.com/popstas/yandex-dialogs-whatis/commit/224a138))



## [2.1.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.1.0...v2.1.1) (2019-01-08)


### Bug Fixes

* yametrika, передавался только вопрос, теперь с ответом ([58a5545](https://github.com/popstas/yandex-dialogs-whatis/commit/58a5545))



# [2.1.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.8...v2.1.0) (2019-01-08)


### Bug Fixes

* host и url убраны из метрики, теперь там только команда ([c0f3fec](https://github.com/popstas/yandex-dialogs-whatis/commit/c0f3fec))


### Features

* yametrika как отдельный middleware ([c171b5d](https://github.com/popstas/yandex-dialogs-whatis/commit/c171b5d))



## [2.0.8](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.7...v2.0.8) (2019-01-08)


### Bug Fixes

* изменен id счетчика метрики ([f87d8c4](https://github.com/popstas/yandex-dialogs-whatis/commit/f87d8c4))



## [2.0.7](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.6...v2.0.7) (2019-01-08)


### Bug Fixes

* не отправлять метрику на ping ([3680293](https://github.com/popstas/yandex-dialogs-whatis/commit/3680293))



## [2.0.6](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.5...v2.0.6) (2019-01-08)


### Bug Fixes

* передача параметров визита в метрику ([d9cf01b](https://github.com/popstas/yandex-dialogs-whatis/commit/d9cf01b))



## [2.0.5](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.4...v2.0.5) (2019-01-08)


### Features

* yametrika, передача данных в яндекс.метрику ([8d4257f](https://github.com/popstas/yandex-dialogs-whatis/commit/8d4257f))



## [2.0.4](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.3...v2.0.4) (2019-01-07)


### Bug Fixes

* на столе ключи запомни ([75f2f4e](https://github.com/popstas/yandex-dialogs-whatis/commit/75f2f4e))



## [2.0.3](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.2...v2.0.3) (2019-01-07)


### Features

* **counter:** подсчет сообщений и визитов у юзера ([7192763](https://github.com/popstas/yandex-dialogs-whatis/commit/7192763))



## [2.0.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.1...v2.0.2) (2019-01-07)


### Features

* **confirm:** повтори [вопрос] ([9c01faf](https://github.com/popstas/yandex-dialogs-whatis/commit/9c01faf))
* **goodbye:** заканчиваем, закончить ([85636a7](https://github.com/popstas/yandex-dialogs-whatis/commit/85636a7))



## [2.0.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v2.0.0...v2.0.1) (2019-01-07)



# [2.0.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.8.5...v2.0.0) (2019-01-07)


### Bug Fixes

* "забудь все вообще" и "демо данные" разрешены на боевом навыке ([5e5ef6e](https://github.com/popstas/yandex-dialogs-whatis/commit/5e5ef6e))



## [1.8.5](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.8.4...v1.8.5) (2018-09-14)


### Features

* меня зовут ([f40d03a](https://github.com/popstas/yandex-dialogs-whatis/commit/f40d03a))



## [1.8.4](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.8.3...v1.8.4) (2018-09-14)


### Bug Fixes

* разрешено больше одного глагола во фразе ([6713edf](https://github.com/popstas/yandex-dialogs-whatis/commit/6713edf))
* сотри все ([fe14ab2](https://github.com/popstas/yandex-dialogs-whatis/commit/fe14ab2))
* ты молодец ([3bac231](https://github.com/popstas/yandex-dialogs-whatis/commit/3bac231))



## [1.8.3](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.8.2...v1.8.3) (2018-07-31)


### Bug Fixes

* **compliment:** правильно молодец ([a844c64](https://github.com/popstas/yandex-dialogs-whatis/commit/a844c64))
* **goodbye:** выйти, выход, закрыть ([c46af5b](https://github.com/popstas/yandex-dialogs-whatis/commit/c46af5b))
* **yes:** точно ([cb1761f](https://github.com/popstas/yandex-dialogs-whatis/commit/cb1761f))
* забыть все ([9933bf4](https://github.com/popstas/yandex-dialogs-whatis/commit/9933bf4))



## [1.8.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.8.1...v1.8.2) (2018-07-27)



## [1.8.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.8.0...v1.8.1) (2018-07-27)


### Bug Fixes

* 1 помощь ([457be89](https://github.com/popstas/yandex-dialogs-whatis/commit/457be89))
* goodbye: показания ([2c1bfd9](https://github.com/popstas/yandex-dialogs-whatis/commit/2c1bfd9))
* yes: так точно ([b489dbb](https://github.com/popstas/yandex-dialogs-whatis/commit/b489dbb))
* пока, исключены фразы "все ..." ([6068c4c](https://github.com/popstas/yandex-dialogs-whatis/commit/6068c4c))



# [1.8.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.7.6...v1.8.0) (2018-07-23)


### Features

* забудь где ([6bf4ac1](https://github.com/popstas/yandex-dialogs-whatis/commit/6bf4ac1))
* подсказка при неудачном втором удалении ([83b2e25](https://github.com/popstas/yandex-dialogs-whatis/commit/83b2e25))



## [1.7.6](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.7.5...v1.7.6) (2018-07-23)


### Bug Fixes

* улучшена отмена ([f5d585c](https://github.com/popstas/yandex-dialogs-whatis/commit/f5d585c))
* улучшено определение да/нет ([e982894](https://github.com/popstas/yandex-dialogs-whatis/commit/e982894))
* улучшены вызовы "пока", "помощь" ([427649e](https://github.com/popstas/yandex-dialogs-whatis/commit/427649e))



## [1.7.5](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.7.4...v1.7.5) (2018-07-21)


### Features

* ну и ... ([603bd01](https://github.com/popstas/yandex-dialogs-whatis/commit/603bd01))
* ответ при ошибке подключения к БД ([80cab79](https://github.com/popstas/yandex-dialogs-whatis/commit/80cab79))



## [1.7.4](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.7.3...v1.7.4) (2018-07-21)


### Bug Fixes

* freeze sdk at 1.4.6 ([291fd05](https://github.com/popstas/yandex-dialogs-whatis/commit/291fd05))
* спасибо пока, поправлены команды "забудь" (не все работали) ([ba0af6e](https://github.com/popstas/yandex-dialogs-whatis/commit/ba0af6e))


### Features

* ответ на "дура" ([f0826da](https://github.com/popstas/yandex-dialogs-whatis/commit/f0826da))



## [1.7.3](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.7.2...v1.7.3) (2018-07-19)


### Bug Fixes

* подсказка про неправильное запоминание с днями недели ([11c3dcd](https://github.com/popstas/yandex-dialogs-whatis/commit/11c3dcd))



## [1.7.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.7.1...v1.7.2) (2018-07-19)



## [1.7.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.7.0...v1.7.1) (2018-07-19)



# [1.7.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.6.0...v1.7.0) (2018-07-19)


### Bug Fixes

* npm add js-yaml ([6de6b0c](https://github.com/popstas/yandex-dialogs-whatis/commit/6de6b0c))
* варианты для "забудь", "что ты знаешь", помощи по действиям ([1479d9d](https://github.com/popstas/yandex-dialogs-whatis/commit/1479d9d))
* удален serverless, т.к. на awl lambda все равно не работает ([b895907](https://github.com/popstas/yandex-dialogs-whatis/commit/b895907))


### Features

* обучение на примере при первом заходе ([3776263](https://github.com/popstas/yandex-dialogs-whatis/commit/3776263))



# [1.6.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.5.1...v1.6.0) (2018-07-17)


### Bug Fixes

* более умные матчеры подтверждения ([60652ed](https://github.com/popstas/yandex-dialogs-whatis/commit/60652ed))
* логирование "Я не знаю" ([e79a439](https://github.com/popstas/yandex-dialogs-whatis/commit/e79a439))


### Features

* запомни без глагола (с предлогом) ([b907787](https://github.com/popstas/yandex-dialogs-whatis/commit/b907787))
* подтверждение "забудь всё", confirmMiddleware ([490164a](https://github.com/popstas/yandex-dialogs-whatis/commit/490164a))
* удали все ([0c58120](https://github.com/popstas/yandex-dialogs-whatis/commit/0c58120))



## [1.5.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.5.0...v1.5.1) (2018-07-15)


### Bug Fixes

* запомни когда с числом во второй части ([031fd32](https://github.com/popstas/yandex-dialogs-whatis/commit/031fd32))



# [1.5.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.4.2...v1.5.0) (2018-07-15)


### Features

* сценарии использования ([3f0ce98](https://github.com/popstas/yandex-dialogs-whatis/commit/3f0ce98))
* убирать "что" из запроса из Алисы "скажи второй памяти что ..." ([95aedc3](https://github.com/popstas/yandex-dialogs-whatis/commit/95aedc3))



## [1.4.2](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.4.1...v1.4.2) (2018-07-15)


### Bug Fixes

* ответ из одного глагола ([00579a0](https://github.com/popstas/yandex-dialogs-whatis/commit/00579a0))


### Features

* Алиса ([5746c4d](https://github.com/popstas/yandex-dialogs-whatis/commit/5746c4d))
* запомни без глагола ([7af29d6](https://github.com/popstas/yandex-dialogs-whatis/commit/7af29d6))
* привет ([30096ce](https://github.com/popstas/yandex-dialogs-whatis/commit/30096ce))
* фраза с "вчера/сегодня/завтра" без глагола ([2e9e4f2](https://github.com/popstas/yandex-dialogs-whatis/commit/2e9e4f2))



## [1.4.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.4.0...v1.4.1) (2018-07-14)


### Features

* вариант забудь (что) ([b3b7b9b](https://github.com/popstas/yandex-dialogs-whatis/commit/b3b7b9b))
* напомни ([a0080d5](https://github.com/popstas/yandex-dialogs-whatis/commit/a0080d5))
* ответ на "тупая" ([8fa39e0](https://github.com/popstas/yandex-dialogs-whatis/commit/8fa39e0))
* ответ на непонятное ([5ec6d3b](https://github.com/popstas/yandex-dialogs-whatis/commit/5ec6d3b))



# [1.4.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.3.1...v1.4.0) (2018-07-14)


### Bug Fixes

* ошибка на неопределенных частях речи (ц) ([b14cdfe](https://github.com/popstas/yandex-dialogs-whatis/commit/b14cdfe))


### Features

* перевернутые конструкции в "запомни" ([080f7a2](https://github.com/popstas/yandex-dialogs-whatis/commit/080f7a2))



## [1.3.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.3.0...v1.3.1) (2018-07-14)


### Bug Fixes

* добавлен node-fetch для нового sdk ([5f0bb0a](https://github.com/popstas/yandex-dialogs-whatis/commit/5f0bb0a))



# [1.3.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.2.0...v1.3.0) (2018-07-14)


### Bug Fixes

* забудь последнее ([53e1a61](https://github.com/popstas/yandex-dialogs-whatis/commit/53e1a61))
* не логировать ping ([3bb36e8](https://github.com/popstas/yandex-dialogs-whatis/commit/3bb36e8))


### Features

* correctorMiddleware, исправление "находиться" ([203904f](https://github.com/popstas/yandex-dialogs-whatis/commit/203904f))
* запомни одной командой во время пошагового заполнения ([90c81e0](https://github.com/popstas/yandex-dialogs-whatis/commit/90c81e0))
* морфология (любой глагол в "запомни") ([ed03608](https://github.com/popstas/yandex-dialogs-whatis/commit/ed03608))
* растет ([cb97bc7](https://github.com/popstas/yandex-dialogs-whatis/commit/cb97bc7))
* удали(ть) конкретное ([9cce012](https://github.com/popstas/yandex-dialogs-whatis/commit/9cce012))



# [1.2.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.1.0...v1.2.0) (2018-07-10)


### Bug Fixes

* fuseOptions для Scene ([33bbeaf](https://github.com/popstas/yandex-dialogs-whatis/commit/33bbeaf))
* больше логов ([3492ccc](https://github.com/popstas/yandex-dialogs-whatis/commit/3492ccc))
* игнорировать регистр в matcher.strings ([cf6beff](https://github.com/popstas/yandex-dialogs-whatis/commit/cf6beff))
* понимать ошибочно распознанное "отвечает что" ([78e24ac](https://github.com/popstas/yandex-dialogs-whatis/commit/78e24ac))


### Features

* глагол в ответе, убрано вечное "находится" при пошаговом ответе ([2b51e2b](https://github.com/popstas/yandex-dialogs-whatis/commit/2b51e2b))
* короткое приветствие бывшим раньше юзерам ([bd492e6](https://github.com/popstas/yandex-dialogs-whatis/commit/bd492e6))
* надо купить ([8fc2bea](https://github.com/popstas/yandex-dialogs-whatis/commit/8fc2bea))
* ответ на вопросы "когда", "в чем" ([d10bac3](https://github.com/popstas/yandex-dialogs-whatis/commit/d10bac3))
* привет в вопросе ([e37ebb5](https://github.com/popstas/yandex-dialogs-whatis/commit/e37ebb5))



# [1.1.0](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.0.1...v1.1.0) (2018-07-08)


### Bug Fixes

* починен драйвер loki для тестов ([dcc3153](https://github.com/popstas/yandex-dialogs-whatis/commit/dcc3153))
* что на дворе находится (глагол в конце) ([4a91c25](https://github.com/popstas/yandex-dialogs-whatis/commit/4a91c25))


### Features

* команды 'отбой', 'все', 'всё', 'хватит', 'закройся' ([072185c](https://github.com/popstas/yandex-dialogs-whatis/commit/072185c))



## [1.0.1](https://github.com/popstas/yandex-dialogs-whatis/compare/v1.0.0...v1.0.1) (2018-07-07)


### Bug Fixes

* не работала команда "отмена" вне сцены in-answer ([87c9fcb](https://github.com/popstas/yandex-dialogs-whatis/commit/87c9fcb))
* не работала команда "пока" ([1a219ea](https://github.com/popstas/yandex-dialogs-whatis/commit/1a219ea))



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



