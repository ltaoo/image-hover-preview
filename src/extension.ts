import vscode, { ExtensionContext, Position, TextDocument } from "vscode";

import path from "path";

import logger from "./log";
import { extraPath, normalizeImage } from "./utils";

export function activate(context: ExtensionContext) {
  logger.log("Image Hover Preview Started!");

  function provideHover(document: TextDocument, position: Position) {
    const fileName = document.fileName;

    // @ts-ignore
    const { _line } = position;
    const line = document.lineAt(_line);
    const lineText = line.text;
    const workDir = path.dirname(fileName);

    const isImportModule =
      lineText.indexOf("import") !== -1 || lineText.indexOf("require") !== -1;

    if (isImportModule) {
      return;
    }

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

      return new vscode.Hover(
        new vscode.MarkdownString(`
  \r\n[![](${url}|width=240)](${url})`)
      );
    } catch (err) {
      logger.error(err);
    }
  }

  [
    "css",
    "javascript",
    "less",
    "typescriptreact",
    "typescript",
    "javascriptreact",
    "html",
    "markdown",
    "vue",
  ].forEach((extension) => {
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(extension, {
        provideHover,
      })
    );
  });
}
