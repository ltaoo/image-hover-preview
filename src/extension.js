const logger = require("./log");

exports.activate = function (context) {
  logger.log("Image Hover Preview Started!");
  require("./hover")(context);
};
