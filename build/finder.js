"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_1 = __importDefault(require("fs"));
const micromatch_1 = __importDefault(require("micromatch"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");

exports.buildIndexTree = () => {
  const svgFiles = getFiles(config_1.config.foldersSvg, "svg");
  const otherFiles = getFiles(
    config_1.config.folders,
    config_1.FILES_EXTENSIONS.filter(extension => extension !== "svg")
  );
  const files = [...svgFiles, ...otherFiles].filter(
    f =>
      !config_1.config.ignore ||
      !micromatch_1.default.isMatch(f, config_1.config.ignore)
  );
  return files
    .filter(file => path_1.default.basename(file).includes("index."))
    .filter(indexPath => {
      const file = fs_1.default.readFileSync(indexPath, { encoding: "utf8" });
      return !/oakbarrel-ignore/g.test(file);
    })
    .reverse()
    .reduce((acc, indexFile) => {
      const filesInOtherIndexes = Object.keys(acc).reduce(
        (indexTree, key) => [...indexTree, ...acc[key]],
        []
      );
      return {
        ...acc,
        [indexFile]: files
          .filter(
            f =>
              f !== indexFile &&
              f.startsWith(path_1.default.dirname(indexFile)) &&
              !filesInOtherIndexes.find(x => x === f)
          )
          .sort()
      };
    }, {});
};

const getFiles = (folders, extensions) =>
  fast_glob_1.default.sync(
    folders.map(
      folder => path_1.default.join(folder, `**/*.{${extensions.join(",")}}`),
      {
        ignore: ["**/node_modules/*", ...(config_1.config.ignore || [])]
      }
    )
  );
