import { extraLocalPath, extraPath } from "../src/utils";

describe("1、Extra local filepath from text", () => {
  it("[1]local relative path", () => {
    const url = 'const image = "./images/icon.png"';

    const res = extraLocalPath(url);

    expect(res).toBe("./images/icon.png");
  });

  it("[2]local absolute path", () => {
    const url = 'const image = "/images/icon.png"';

    const res = extraLocalPath(url);

    expect(res).toBe("/images/icon.png");
  });
});

describe("1、Extra path from text", () => {
  it("[1]url has protocol", () => {
    const url = 'const image = "https://static.ltaoo.work/15352809220087";';

    const res = extraPath(url);

    expect(res).toStrictEqual({
      type: 1,
      path: "https://static.ltaoo.work/15352809220087",
    });
  });

  it("[2]url no protocol", () => {
    const url = 'const image = "//static.ltaoo.work/15352809220087";';

    const res = extraPath(url);

    expect(res).toStrictEqual({
      type: 1,
      path: "//static.ltaoo.work/15352809220087",
    });
  });

  it("[3]local relative path", () => {
    const url = 'const image = "./images/icon.png"';

    const res = extraPath(url);

    expect(res).toStrictEqual({ type: 2, path: "./images/icon.png" });
  });

  it("[4]local absolute path", () => {
    const url = 'const image = "/images/icon.png"';

    const res = extraPath(url);

    expect(res).toStrictEqual({ type: 2, path: "/images/icon.png" });
  });
});
