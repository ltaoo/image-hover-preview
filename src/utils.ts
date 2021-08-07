const path = require("path");

export enum IMAGE_TYPE {
  Online = 1,
  Local = 2,
}
export interface IImage {
  type: IMAGE_TYPE;
  path: string;
}

/**
 * 图片是否有协议头
 * @param {{ type: number; path: string }} image
 * @returns boolean
 */
export function hasProtocol(image: IImage) {
  const { type, path } = image;
  if (type === IMAGE_TYPE.Local) {
    return false;
  }
  if (path.slice(0, 2) !== "//") {
    return true;
  }
  return false;
}

/**
 * 增加协议头
 * @param {{ type: number; path: string }} image
 */
export function addHttpsProtocol(image: IImage) {
  if (!hasProtocol(image)) {
    return `https:${image.path}`;
  }
  return image.path;
}

/**
 * 从一段文本中提取出网络地址
 */
export function extraOnlinePath(content: string) {
  const regexp =
    /((https?):)?\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
  const res = content.match(regexp);
  if (res !== null) {
    return res[0];
  }
  return null;
}

const pathPrefix = "(\\.\\.?|\\~)";
const pathSeparatorClause = "\\/";
// '":; are allowed in paths but they are often separators so ignore them
// Also disallow \\ to prevent a catastropic backtracking case #24798
const excludedPathCharactersClause = "[^\\0\\s!$`&*()\\[\\]+'\":;\\\\]";
/** A regex that matches paths in the form /foo, ~/foo, ./foo, ../foo, foo/bar */
const unixLocalLinkClause =
  "((" +
  pathPrefix +
  "|(" +
  excludedPathCharactersClause +
  ")+)?(" +
  pathSeparatorClause +
  "(" +
  excludedPathCharactersClause +
  ")+)+)";

const winDrivePrefix = "[a-zA-Z]:";
const winPathPrefix = "(" + winDrivePrefix + "|\\.\\.?|\\~)";
const winPathSeparatorClause = "(\\\\|\\/)";
const winExcludedPathCharactersClause =
  "[^\\0<>\\?\\|\\/\\s!$`&*()\\[\\]+'\":;]";
/** A regex that matches paths in the form c:\foo, ~\foo, .\foo, ..\foo, foo\bar */
const winLocalLinkClause =
  "((" +
  winPathPrefix +
  "|(" +
  winExcludedPathCharactersClause +
  ")+)?(" +
  winPathSeparatorClause +
  "(" +
  winExcludedPathCharactersClause +
  ")+)+)";

const _winLocalLinkPattern = new RegExp(`${winLocalLinkClause}`, "g");
const _unixLinkPattern = new RegExp(`${unixLocalLinkClause}`, "g");

/**
 * 从一段文本中提取出本地图片地址
 * @param {string} content - 文本
 * @returns - null | string
 */
export function extraLocalPath(content: string) {
  let match;
  const result = [];
  while ((match = _unixLinkPattern.exec(content))) {
    if (match.length > 1) {
      const imagePath = match[1];
      result.push(imagePath);
    }
  }
  if (result.length) {
    return result.join("");
  }
  while ((match = _winLocalLinkPattern.exec(content))) {
    if (match.length > 1) {
      const imagePath = match[1];
      result.push(imagePath);
    }
  }
  if (result.length) {
    return result.join("");
  }
  return null;
}

/**
 * 从一段文本中提取出图片地址，网络图片或者本地图片
 * @param {string} content - 文本
 */
export function extraPath(content: string) {
  const onlinePath = extraOnlinePath(content);
  if (onlinePath !== null) {
    return {
      type: IMAGE_TYPE.Online,
      path: onlinePath,
    };
  }
  const localPath = extraLocalPath(content);
  if (localPath !== null) {
    return {
      type: IMAGE_TYPE.Local,
      path: localPath,
    };
  }
  return null;
}

/**
 *
 * @param {{ type: number; path: string }} image
 * @param {string} dir
 */
export function normalizeLocalFilepath(image: IImage, dir: string) {
  const { path: url } = image;
  return path.resolve(dir, url);
}
/**
 *
 * @param {{ type: number; path: string }} image
 */
export function normalizeImage(image: IImage, dir: string) {
  const { type } = image;
  if (type === IMAGE_TYPE.Online) {
    return addHttpsProtocol(image);
  }
  if (type === IMAGE_TYPE.Local) {
    return normalizeLocalFilepath(image, dir);
  }
  return null;
}
