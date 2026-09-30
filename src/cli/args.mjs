// 轻量参数解析：支持 --key value、--flag、--no-flag、-h/-v 与位置参数（命令）。
export function parseArgs(argv) {
    const options = {};
    const flags = new Set();
    const positionals = [];

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "-h") { flags.add("help"); continue; }
        if (arg === "-v") { flags.add("version"); continue; }

        if (arg.startsWith("--no-")) {
            options[arg.slice(5)] = false;
            flags.add(`no-${arg.slice(5)}`);
            continue;
        }

        if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const next = argv[i + 1];
            if (next !== undefined && !next.startsWith("-")) {
                options[key] = next;
                i++;
            } else {
                options[key] = true;
                flags.add(key);
            }
            continue;
        }

        positionals.push(arg);
    }

    return { command: positionals.shift(), positionals, options, flags };
}

export function hasFlag(flags, key) {
    return flags.has(key);
}
