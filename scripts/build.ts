
import { copyFiles } from "./copy-files.js";
import pkg from "../package.json" with { type: "json" };

const srcFile = "./dist/index.html"
const outFile = `./build/${pkg.name}-v${pkg.version}.html`;

copyFiles(srcFile, outFile)
