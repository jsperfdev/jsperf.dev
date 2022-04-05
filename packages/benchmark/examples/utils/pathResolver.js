import path from "node:path";
import url from "node:url";

export const pathResolver = (mainFile, filePath) => path.resolve(
    path.dirname(url.fileURLToPath(mainFile)),
    filePath
);