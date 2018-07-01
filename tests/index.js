'use strict'
const { Scenarios } = require('./scenarios');
const url = process.env.URL || 'https://whatis.dialogs.popstas.ru';
// const url = process.env.URL || 'https://localhost:3002';

(async() => {
  const scenarios = new Scenarios('./static/scenarios.yml', url);
  try{
    const isErrors = await scenarios.run();
    console.log('exit');
    process.exit(isErrors);
  } catch(err){
    console.log(err);
  }
})();
