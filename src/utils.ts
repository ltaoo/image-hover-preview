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

/**
 * 从一段文本中提取出本地图片地址
 * @param {string} content - 文本
 * @returns - null | string
 */
export function extraLocalPath(content: string) {
  const linuxRegexp =
    /(?:[A-Z]:|\\|(?:\.{1,2}[\/\\])+)[\w+\\\s_\(\)\/]+(?:\.\w+)*/;
  let file = content.match(linuxRegexp);
  if (file !== null) {
    const filepath = file[0];
    const { ext } = path.parse(filepath);
    if (ext !== '') {
      return filepath;
    }
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
