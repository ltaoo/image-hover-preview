import path from "path";

import vscode, { ExtensionContext, Position, TextDocument } from "vscode";

import logger from "./log";
import { extraPath, fetchImgInfo } from "./utils";

interface PluginSettings {
  /** 是否展示文件大小 */
  showSize: boolean;
  /** 需要忽略的图片地址 */
  ignore: (string | RegExp)[];
  /** 支持的文档类型，见 https://code.visualstudio.com/api/references/document-selector */
  languages: string[];
}

export function activate(context: ExtensionContext) {
  logger.log("Image Hover Preview Started!");
  const settings = vscode.workspace.getConfiguration("imageHoverPreview");
  const { showSize, ignore, languages } = settings as any as PluginSettings;

  async function provideHover(document: TextDocument, position: Position) {
    const fileName = document.fileName;

    const { line: lineNumber } = position;
    const line = document.lineAt(lineNumber);
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

      const extraImageInfo = await (async () => {
        if (showSize === false) {
          return "";
        }
        const { width, height, size } = await fetchImgInfo(originalImage);
        return `\r\n${size}(${width}x${height})`;
      })();

      return new vscode.Hover(
        new vscode.MarkdownString(`
  \r\n[![](${url})](${url})
  ${extraImageInfo}
  `)
      );
    } catch (err) {
      logger.error(err);
    }
  }
  languages.forEach((language) => {
    vscode.languages.registerHoverProvider(language, {
      provideHover,
    });
  });
}
