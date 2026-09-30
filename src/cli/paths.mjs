// 包内路径解析：无论从 bin 还是被依赖，都定位到仓库/技能根。
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const packageRoot = resolve(here, "..", "..");
export const skillRoot = resolve(packageRoot, "skills", "spring-vue-stack");
export const assetsRoot = resolve(skillRoot, "assets");
export const skillScriptsDir = resolve(skillRoot, "scripts");
