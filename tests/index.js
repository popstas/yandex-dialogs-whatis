'use strict'
const { Scenarios } = require('./scenarios');

(async() => {
  const scenarios = new Scenarios('./static/scenarios.yml', 'http://localhost:3002');
  try{
    const isErrors = await scenarios.run();
    console.log('exit');
    process.exit(isErrors);
  } catch(err){
    console.log(err);
  }
})();
