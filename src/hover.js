const vscode = require("vscode");
const path = require("path");
const { extraPath, normalizeImage, hasProtocol } = require("./utils");

const logger = require("./log");

/**
 * @param {*} document
 * @param {*} position
 */
function provideHover(document, position) {
  const fileName = document.fileName;

  const { _line } = position;
  const line = document.lineAt(_line);
  const lineText = line.text;
  const workDir = path.dirname(fileName);

  try {
    const originalImage = extraPath(lineText);

    logger.log("Extra filepath from content");
    logger.log(originalImage);
    logger.enter();

    if (originalImage === null) {
      return;
    }

    const url = normalizeImage(originalImage, workDir);
    logger.log(`normalized image is ${url}`);
    if (url === null) {
      return;
    }
    logger.log(`displayed image path is ${url}`);
    const followLink = hasProtocol(originalImage)
      ? ""
      : `[Follow link](${url}) (cmd + click)
_________________`;
    return new vscode.Hover(
      new vscode.MarkdownString(`${followLink}
  \r\n[![](${url}|width=240)](${url})

  \r\n`)
    );
  } catch (err) {
    logger.error(err);
  }
}

module.exports = function (context) {
  [
    "css",
    "javascript",
    "less",
    "tsx",
    "typescript",
    "jsx",
    "html",
    "markdown",
  ].forEach((extension) => {
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(extension, {
        provideHover,
      })
    );
  });
};
