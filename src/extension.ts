import path from "path";

import vscode, { ExtensionContext, Position, TextDocument } from "vscode";

import logger from "./log";
import { extraPath, fetchImgInfo } from "./utils";

export function activate(context: ExtensionContext) {
  logger.log("Image Hover Preview Started!");

  async function provideHover(document: TextDocument, position: Position) {
    const fileName = document.fileName;
    const { showSize, ignore } =
      vscode.workspace.getConfiguration("imageHoverPreview");

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
      const originalImage = extraPath(lineText, { dir: workDir, ignore });

      logger.log("Extra filepath from content");
      logger.log(originalImage);
      logger.enter();

      if (originalImage === null) {
        return;
      }

      const { path: url } = originalImage;
      if (url === null) {
        return;
      }
      logger.log(`displayed image path is ${url}`);

      const editorLineEndSequence = vscode.workspace.getConfiguration('files').get('eol');

      let extraImageInfo = "";
      if (showSize !== false) {
        const { width, height, size } = await fetchImgInfo(originalImage);
        extraImageInfo = `${editorLineEndSequence}${size}(${width}x${height})`;
      }

      return new vscode.Hover(
        new vscode.MarkdownString(`${extraImageInfo}${editorLineEndSequence}[![](${url})](${url})${editorLineEndSequence}
  `)
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
