const yaml = require('js-yaml');
const fs = require('fs');

module.exports = {
  intent: 'changelog',
  matcher: [
    'что нового',
    'что изменилось',
    'изменения',
    'обновление',
    'обновления',
    'какие обновления',
    'change log',
    'история изменений',
    'какие были изменения в навыке',
    'чему ты научилась'
  ],

  async handler(ctx) {
    const logLimit = 5; // максимум изменений, которые выдаются за один раз

    // текст начала ответа
    let textBegin = '';
    if (ctx.user.state.visitor.visits > 1) {
      textBegin = 'С вашего последнего посещения я';
    } else {
      textBegin = 'В 2019 году я';
    }

    // дата, от которой читать лог
    let fromDate = new Date(0);
    if (ctx.user.state.visitor.lastChangelogDate) {
      fromDate = new Date(ctx.user.state.visitor.lastChangelogDate);
    }

    ctx.user.state.visitor.lastChangelogDate = new Date(
      ctx.user.state.visitor.lastVisitDate || 0
    ).getTime();

    fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

    // получение строк лога
    const doc = yaml.safeLoad(fs.readFileSync('changelog-bot.yml', 'utf-8'));
    const fullLog = Object.entries(doc).map(line => {
      return {
        date: line[0],
        text: line[1]
      };
    });
    let matchedLog = fullLog.filter(logLine => {
      const match = logLine.date.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      const day = match[1];
      const month = match[2] - 1;
      const year = match[3];
      const logDate = new Date(year, month, day);

      return fromDate.getTime() <= logDate.getTime();
    });
    let matchedCount = matchedLog.length;

    // ничего не нашлось
    if (matchedCount == 0) {
      return await ctx.reply(textBegin + ' ничему не научилась');
    }

    // нашлось слишком много
    if (matchedCount > logLimit) matchedLog = matchedLog.slice(0, logLimit + 1);

    const textEnd = matchedCount > logLimit ? '.\nИ это еще не всё!' : '';

    // текст с датами для чтения глазами, даты не произносятся
    let logText = matchedLog.map(logLine => `${logLine.date}: ${logLine.text}`).join(',\n');
    logText = textBegin + ':\n' + logText + textEnd;
    let logTTS = matchedLog.map(logLine => `${logLine.text}`).join(',\n');
    logTTS = textBegin + ':\n' + logTTS + textEnd;
    // console.log('logText: ', logText);
    // console.log('logTTS: ', logTTS);

    return await ctx.reply(logText, [], { tts: logTTS });
  }
};
