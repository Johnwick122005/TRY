var chalk = require('chalk');
var execSync = require('child_process').execSync;
var path = require('path');

var execOptions = { encoding: 'utf8' };

function isProcessAReactApp(processCommand) {
  return /^node .*react-scripts\/scripts\/start\.js\s?$/.test(processCommand);
}

function getProcessIdOnPort(port) {
  return execSync('lsof -i:' + port + ' -P -t -sTCP:LISTEN', execOptions).trim();
}

function getPackageNameInDirectory(directory) {
  var packagePath = path.join(directory.trim(), 'package.json');

  try {
    return require(packagePath).name;
  } catch(e) {
    return null;
  }

}

function getProcessCommand(processId, processDirectory) {
  var command = execSync('ps -o command -p ' + processId + ' | sed -n 2p', execOptions);

  if (isProcessAReactApp(command)) {
    const packageName = getPackageNameInDirectory(processDirectory);
    return (packageName) ? packageName + '\n' : command;
  } else {
    return command;
  }

}

function getDirectoryOfProcessById(processId) {
  return execSync('lsof -p '+ processId + ' | grep cwd | awk \'{print $9}\'', execOptions).trim();
}

function getProcessForPort(port) {
  try {
    var processId = getProcessIdOnPort(port);
    var directory = getDirectoryOfProcessById(processId);
    var command = getProcessCommand(processId, directory);
    return chalk.cyan(command) + chalk.blue('  in ') + chalk.cyan(directory);
  } catch(e) {
    return null;
  }
}

module.exports = getProcessForPort;

