#! /usr/bin/env node
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');
shell.config.silent = true;

// retrieve stream from command when no args
let inputBuffer = '';
if (!process.argv[2]) {
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => inputBuffer += chunk);
  process.stdin.on('end', () => start());
} else {
  // else directly start
  start();
}

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

function fetchDesc(package, dependencies) {
  console.log(`----------- Dependencies for ${chalk.green(package)}----------------`)
  let cmds = dependencies.map(dp => `npm show ${dp} description`);
  cmds.forEach(cmd => execute(cmd).then(printResults));
}

function showUsage() {
  console.log('Usage:');
  console.log('        Parse package.json: cat package.json | pkgd');
  console.log('        Directly input    : pkgd <package name>');
}

async function start() {
  let pkg = '';
  let mode = '';

  if (inputBuffer) {
    try {
      pkg = JSON.parse(inputBuffer.toString());
      mode = 'PARSE';    
    } catch(error) {
      console.error('Error occured when parsing target file...');
      console.log('Usage:');
      console.log('       cat package.json | pkgd');
      console.log(' or    pkgd < package.json');
      process.exit(-1);
    }
  } else {
    pkg = process.argv[2];
    let query = path.normalize(pkg);
    let testPath = path.join(query, 'package.json');
    console.log(`Looking for package.json in ${query}`);
    if (fs.existsSync(testPath)) {
      pkg = JSON.parse(fs.readFileSync(testPath, {encoding: 'utf8'}).toString());
      mode = 'PATH';
    } else {
      console.log(`Package config not found locally, try to fetch online...`);
      mode = 'FETCH';
    }
  }

  if (!pkg) {
    console.error('Invalid package name.');
    showUsage();
  }

  switch (mode) {
    case 'FETCH':
      fetchDesc(pkg, await fetchList(pkg));
      break;
    case 'PARSE':
    case 'PATH':
      fetchDesc(pkg.name, Object.keys(pkg.dependencies));
      break; 
  }
}

// start();