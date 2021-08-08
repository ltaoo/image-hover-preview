import { extraLocalPath, extraOnlinePath } from "../src/utils";

describe("1、Extra local image path", () => {
  it("[1]relative local path", () => {
    const url = 'const image = "./images/icon.png"';

    const localPath = extraLocalPath(url);
    expect(localPath).toBe("./images/icon.png");

    const onlinePath = extraOnlinePath(url);
    expect(onlinePath).toBe(null);
  });

  it("[2]absolute local path", () => {
    const url = 'const image = "/images/icon.png"';

    const localPath = extraLocalPath(url);
    expect(localPath).toBe("/images/icon.png");

    const onlinePath = extraOnlinePath(url);
    expect(onlinePath).toBe(null);
  });

  it("[3]win absolute local path", () => {
    const url = 'const image = "C:\\images\\icon.png"';

    const localPath = extraLocalPath(url);
    expect(localPath).toBe("C:\\images\\icon.png");

    const onlinePath = extraOnlinePath(url);
    expect(onlinePath).toBe(null);
  });

  it("[4]win relative local path", () => {
    const url = 'const image = "\\images\\icon.png"';

    const localPath = extraLocalPath(url);
    expect(localPath).toBe("\\images\\icon.png");

    const onlinePath = extraOnlinePath(url);
    expect(onlinePath).toBe(null);
  });

  it("[5]win relative local path with ignore configure", () => {
    const url = 'const image = "./output/something/image.png"';

    const localPath = extraLocalPath(url, { ignore: ["./output"] });
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(url);
    expect(onlinePath).toBe(null);
  });
});

describe("2、Extra online image path", () => {
  it("[1]url has protocol", () => {
    const text = 'const image = "https://static.ltaoo.work/15352809220087";';

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe("https://static.ltaoo.work/15352809220087");
  });

  it("[2]url no protocol", () => {
    const text = 'const image = "//static.ltaoo.work/15352809220087";';

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe("//static.ltaoo.work/15352809220087");
  });

  it("[3]url no protocol with ignore configure", () => {
    const text = 'const image = "//static.ltaoo.work/15352809220087";';

    const localPath = extraLocalPath(text, { ignore: [/\/\/static/] });
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe(null);
  });
});

describe("3、some text like image path", () => {
  it("[1]comment", () => {
    const text = "// this is comment.";

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe(null);
  });

  it("[2]close tag", () => {
    const text = "<div></div>";

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe(null);
  });

  it("[3]alias component import", () => {
    const text = "import SimpleTable from '@/components/SimpleTable'";

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe(null);
  });

  it("[4]relative css file import", () => {
    const text = "import ss from './index.less'";

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe(null);
  });

  it("[5]relative component file import", () => {
    const text = "import { withMaxLength } from './maxLength'";

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe(null);
  });

  it("[6]namespace lib import", () => {
    const text = "import babel from '@babel/core'";

    const localPath = extraLocalPath(text);
    expect(localPath).toBe(null);

    const onlinePath = extraOnlinePath(text);
    expect(onlinePath).toBe(null);
  });
});
