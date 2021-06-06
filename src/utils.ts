const path = require("path");

const IMAGE_TYPES = {
  Online: 1,
  Local: 2,
};

/**
 * 图片是否有协议头
 * @param {{ type: number; path: string }} image
 * @returns boolean
 */
export function hasProtocol(image) {
  const { type, path } = image;
  if (type === IMAGE_TYPES.Local) {
    return false;
  }
  if (path.slice(0, 2) !== "//") {
    return true;
  }
  return false;
}

/**
 *
 * @param {{ type: number; path: string }} image
 */
export function normalizeUrl(image) {
  if (!hasProtocol(image)) {
    return `https:${image.path}`;
  }
  return image.path;
}

export function extraOnlinePath(content) {
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
 * @param {string} content - 文本
 * @returns - null | string
 */
export function extraLocalPath(content) {
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
 *
 * @param {string} content - 文本
 */
export function extraPath(content) {
  const localPath = extraLocalPath(content);
  const onlinePath = extraOnlinePath(content);

  if (onlinePath !== null) {
    return {
      type: IMAGE_TYPES.Online,
      path: onlinePath,
    };
  }
  if (localPath !== null) {
    return {
      type: IMAGE_TYPES.Local,
      path: localPath,
    };
  }
  return null;
};

/**
 *
 * @param {{ type: number; path: string }} image
 * @param {string} dir
 */
export function normalizeLocalFilepath(image, dir) {
  const { path: url } = image;
  return path.resolve(dir, url);
}
/**
 *
 * @param {{ type: number; path: string }} image
 */
export function normalizeImage(image, dir) {
  const { type } = image;
  if (type === IMAGE_TYPES.Online) {
    return normalizeUrl(image);
  }
  if (type === IMAGE_TYPES.Local) {
    return normalizeLocalFilepath(image, dir);
  }
  return null;
}
