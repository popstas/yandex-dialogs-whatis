const Az = require('az');

const az = {
  // ('торт', 2) => '2 торта'
  pluralWord(msg, count) {
    const plur = msg
      .split(' ')
      .map(word => {
        const w = Az.Morph(word);
        return w[0].pluralize(count);
      })
      .join(' ');
    return count + ' ' + plur;
  },

  // ['один', 'два', 'три'] => 'один, два и три'
  andList(words, joinStr = ', ') {
    if (words.length <= 1) return words.join(', ');
    return words.slice(0, words.length - 1).join(joinStr) + ' и ' + words[words.length - 1];
  }
};

module.exports = () => (ctx, next) => {
  ctx.az = az;
  return next(ctx);
};
