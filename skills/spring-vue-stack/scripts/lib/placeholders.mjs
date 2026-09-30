// 模板占位符映射与替换。
export const DEFAULT_BOOT_VERSION = "4.1.0";

export function buildPlaceholderMap({
    backendDir,
    backendArtifact,
    frontendName,
    group,
    packageName,
    frontendPackage,
    bootVersion
}) {
    return {
        __BACKEND_DIR__: backendDir,
        __BACKEND_ARTIFACT__: backendArtifact,
        __FRONTEND_NAME__: frontendName,
        __GROUP__: group,
        __PACKAGE__: packageName,
        __PACKAGE_PATH__: packageName.split(".").join("/"),
        __FRONTEND_PACKAGE__: frontendPackage,
        __BOOT_VERSION__: bootVersion ?? DEFAULT_BOOT_VERSION
    };
}

export function applyPlaceholders(text, map) {
    let out = text;
    for (const [k, v] of Object.entries(map)) {
        out = out.split(k).join(v);
    }
    return out;
}
