#!/usr/bin/env node
import { run } from "../src/cli/index.mjs";

run(process.argv.slice(2)).catch(err => {
    console.error(`\n错误: ${err.message}`);
    process.exit(1);
});
