# yandex-dialogs-whatis

[![Build Status](https://travis-ci.org/popstas/yandex-dialogs-whatis.svg?branch=master)](https://travis-ci.org/popstas/yandex-dialogs-whatis)

Бот отвечает на вопросы и умеет записывать новые ответы, умеет вести список покупок.

У каждого пользователя собственная база вопросов и ответов.

По умолчанию запускается на \*:2756

[Блогпост с техническим описанием](https://blog.popstas.ru/blog/2020/04/13/yandex-dialogs-whatis/).

## Сценарии использования

Я посмотрел несколько дней, как люди используют навык и понял, что не хватает примеров использования. Почти все пытаются использовать навык как напоминалку: "завтра будет дождь" и т.д. она не будет так работать нормально, т.к. когда наступит завтра, для навыка запись не превратится в "сегодня". Опишу сценарии, для которых навык должен хорошо сработать.

1. "Список покупок". Спросить можно так: "что в магазине". Главное условие: продукт должен состоять из одного слова (если добавляются не через "плюс-минус" технику). Добавлять можно по-разному, вот примеры:

- добавь в список покупок сыр
- в магазине надо купить белый хлеб и молоко
- надо купить сметану
- удали сметану из списка
- список покупок
- что купить в магазине
- плюс мандарины минус бананы плюс шоколад (идея взята [здесь](https://dialogs.yandex.ru/store/skills/19170605-golosovoj-spisok-plyus-minus))

Навык сделан так, чтобы вписаться в сценарий: на кухне стоит мини-колонка, через нее легко добавлять продукты в список покупок. Колонка связана со смартфоном, на нем можно смотреть список в магазине.

2. "Виртуальные подписи". Изначально задумка была такая: у меня есть несколько бутыльков с жидкостями, подписывать я их не могу, так как содержимое периодически меняется. Поэтому я промаркировал их цветами. Вторая память в этом случае заменяет подписи на бутыльках, когда я меняю жидкость, говорю: "в красном налит арбуз". После этого я могу спросить "где арбуз" или "что в красном".

3. "Помощь мастеру". Если вам приходилось когда-нибудь разбирать технику или собирать девайсы на платформах типа Arduino или ESP, вы знаете, что собрать обратно бывает непросто, если не запоминать процесс разборки. Навык может помочь в простых случаях (в сложных проще сделать фотографии до разборки). Например, можно запоминать соответствия "пин - цвет": "в первом воткнут синий", а потом спросить при сборке: "где синий".

4. "Расписание". Это может быть расписание пар в школе или меню в столовой. "в среду в школе будет математика, русский, черчение, физика" - "что будет в среду в школе", "в пятницу в столовой будут щи" - "что будет в пятницу в столовой".

5. "Показания счетчиков". Если вы передаёте показания счетчиков электричества или воды, вы знаете, что нужно либо запомнить несколько цифр, либо подходить с листочком. Со второй памятью это можно сделать так: "тариф 1 набежало 2568" - "что тариф 1", "холодная натекло 321" - "что холодная".

## Команды:

- Добавляйте покупки в список покупок
- Начните фразу со "что/кто", чтобы получить ответ. Например: "что на дворе"
- Начните фразу с "где/когда/в чем", чтобы найти место, где это что-то лежит. Например: "где трава"
- Скажите "запомни", чтобы добавить новый ответ
- Скажите "команды", чтобы посмотреть примеры
- Можно быстро добавить новый ответ так: "запомни ... находится/лежит/стоит ..."
- Можно удалить последний ответ, сказав "удали/забудь последнее"
- Если надо удалить что-то другое, скажите, например, "удали/забудь на дворе"
- Свяжите несколько устройств, скажите "скажи код", произнесите код на подключаемом устройства
- Можно просить повторить: "повтори" или "что ты услышала"
- При тестовом запуске доступна команда "демо данные"

## Известные проблемы:

- Нельзя запомнить сразу несколько вещей (в списке покупок можно)
- Не умеет понимать временные запоминания, типа "запомни завтра футбол", обязательно должен быть глагол: "запомни завтра будет футбол"
- Для списка покупок, расписания и некоторых других сценариев надо дополнять, а не заменять, реализовано только для списка покупок

## Технические особенности

- Сделано на [yandex-dialogs-sdk](https://github.com/fletcherist/yandex-dialogs-sdk), используются commands, scenes, matchers, middlewares из SDK
- Выбор хранилища между MongoDB и Loki (локальное файловое хранилище)
- Выбор сценария на основе простого морфологического разбора
- Система тестирования на основе [сценариев](/static/scenarios.yml), работает на [yandex-dialogs-client](https://github.com/popstas/yandex-dialogs-client) и на [travis](https://travis-ci.org/popstas/yandex-dialogs-whatis)
- Модульность команд (подробнее в CONTRIBUTING.md), главный файл навыка состоит только из подключений middlewares и commands
- Метрики передаются в [chatbase](https://github.com/popstas/yandex-dialogs-sdk-chatbase), с полной разметкой intents и в Яндекс.Метрику
- Лог запросов и ответов с id юзеров, номером визита и номером сообщения в визите
- Корректировка типичных неправильных ударений
- Строка очищается от ненужных слов с учетом контекста запроса
- Упрощенное указание эффектов: `[megaphone]говорите громче!` вместо `<speaker effect="megaphone">говорите громче!`
- Возможность указывать некоторую фонетическую разметку в text, а не в tts

## Особенности диалога

- Местами есть вариативность ответов
- Умеет отвечать на типичные фразы: приветствие, благодарность, оскорбление
- Пытается понять, что пользователь сказал неправильно и подсказать
- Обучающий тур при первом заходе
- Необязательные подтверждения (скажите `да`, `нет` или другую команду)
- Знает свою версию (`версия`) и итеративная история изменений (`что нового`)
- Умеет повторять последний ответ или вопрос (`повтори`)
- Различает новых юзеров и повторных
- Знает некоторые вещи, на которые она понимает, что не знает ответ
- Умеет связывать несколько устройств, чтобы все они помнили одно и то же

## TODO:

- greetings, welcomeExample - отвечать рандомным примером при первом общении
- отправка списка на email
- проработать показания счетчиков
электричество 1 2 3 4
электричество тариф 1 23 45
тариф 2 2456
показания
показания счетчиков
показания электричества
электричество тариф 1

### Проблемные фразы:

- добавь кока колу селедку под шубой чай christmas mystery батон нарезной чупа чупс и майонез провансаль
- так
- так в начале
- стоп
- домой
- не понимаю (некоторые юзеры признаются, что разговор не удается)
- я не поняла
- не понял
- в смысле
- удали все по списку
- очистить всю память
- очистить всю историю
- как пользоваться...
- иди на...
- 16  але
- алло
- х*й
- ха ха ха
- ты меня слышишь