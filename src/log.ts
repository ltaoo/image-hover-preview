// import * as prettier from 'prettier';
const { window } = require("vscode");

// type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

const outputChannel = window.createOutputChannel("Image Hover Preview");

function line() {
  outputChannel.appendLine("\n");
}

/**
 *
 * @param {string} message
 * @param {'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE'} logLevel
 */
function logMessage(message, logLevel) {
  const cur = new Date().toLocaleTimeString();
  outputChannel.appendLine(`["${logLevel}" - ${cur}] ${message}`);
}
function logObj(data) {
  const message = JSON.stringify(data, null, 2).trim();
  outputChannel.appendLine(message);
}

function log(message) {
  if (typeof message === "object") {
    logObj(message);
    return;
  }
  logMessage(message, "INFO");
}

function error(error) {
  logMessage(error.message, "ERROR");
  logObj(error.stack);
}

export default {
  log,
  error,
  enter: line,
};
