#! /usr/bin/env node

const shell = require('shelljs');
const chalk = require('chalk');
shell.config.silent = true;

function execute(cmd, callback) {
  if (callback && typeof callback === 'function') {
    let child = shell.exec(cmd, {async:true});
    child.stdout.on('data', data => callback(data, cmd));
  } else {
    // promise style
    return new Promise((resolve, reject) => {
      let child = shell.exec(cmd, {async:true});
      child.stdout.on('data', data => resolve({result: data, cmd}));
    })
  }
}

function fetchList(target) {
  let cmd = `npm show ${target} dependencies --json`;
  return new Promise((resolve, reject) => {
    execute(cmd).then(({result, cmd})=> {
      let data = JSON.parse(result);
      let pkgList = Object.keys(data);
      resolve(pkgList);
    });
  });
}

function printResults({result, cmd}){
  let pkg;
  try{
    pkg = new RegExp('show\\s+([\\d-\\w]+)\\s+description', 'i').exec(cmd)[1];
    console.log(chalk.cyan(`${pkg}`));
    console.log(`${chalk.yellow('>')} ${result.trimRight()}\n`);
  } catch (error) {
    console.log(cmd + ' fail');
  }
}

function start() {
  let target = process.argv[2];
  fetchList(target).then(packages => {
    console.log(`----------- Dependencies for ${chalk.green(target)}----------------`)
    let cmds = packages.map(pkg => `npm show ${pkg} description`);
    cmds.forEach(cmd => execute(cmd).then(printResults));
  });
}

start();