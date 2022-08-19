var $75ApV$path = require("path");
var $75ApV$parcelplugin = require("@parcel/plugin");
var $75ApV$parcelsourcemap = require("@parcel/source-map");
var $75ApV$less = require("less");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $65be2ac9a55cf399$export$2e2bcd8739ae039);





async function $dc1224dde4da9bce$export$11e63f7b0f3d9900({ config: config  }) {
    let configFile = await config.getConfig([
        ".lessrc",
        ".lessrc.js",
        ".lessrc.cjs"
    ], {
        packageKey: "less"
    });
    let configContents = {};
    if (configFile != null) {
        configContents = configFile.contents; // Resolve relative paths from config file
        if (configContents.paths) configContents.paths = configContents.paths.map((p)=>(0, ($parcel$interopDefault($75ApV$path))).resolve((0, ($parcel$interopDefault($75ApV$path))).dirname(configFile.filePath), p));
    }
    configContents.javascriptEnabled = true; // Rewrites urls to be relative to the provided filename
    configContents.rewriteUrls = "all";
    configContents.plugins = configContents.plugins || []; // This should enforce the config to be reloaded on every run as it's JS
    let isDynamic = configFile && (0, ($parcel$interopDefault($75ApV$path))).extname(configFile.filePath) === ".js";
    if (isDynamic) config.invalidateOnStartup();
    return {
        isStatic: !isDynamic,
        config: configContents
    };
}


const $65be2ac9a55cf399$var$WEBPACK_ALIAS_RE = /^~[^/]/;
var $65be2ac9a55cf399$export$2e2bcd8739ae039 = new (0, $75ApV$parcelplugin.Transformer)({
    loadConfig ({ config: config  }) {
        return (0, $dc1224dde4da9bce$export$11e63f7b0f3d9900)({
            config: config
        });
    },
    async transform ({ asset: asset , options: options , config: config , resolve: resolve  }) {
        asset.type = "css";
        asset.meta.hasDependencies = false;
        let code = await asset.getCode();
        let result;
        try {
            let lessConfig = config ? {
                ...config.config
            } : {};
            if (asset.env.sourceMap) lessConfig.sourceMap = {};
            lessConfig.filename = asset.filePath;
            lessConfig.plugins = [
                ...lessConfig.plugins || [],
                $65be2ac9a55cf399$var$urlPlugin({
                    asset: asset
                }),
                $65be2ac9a55cf399$var$resolvePathPlugin({
                    asset: asset,
                    resolve: resolve
                })
            ];
            result = await (0, ($parcel$interopDefault($75ApV$less))).render(code, lessConfig);
        } catch (err) {
            // For the error reporter
            err.fileName = err.filename;
            err.loc = {
                line: err.line,
                column: err.column
            };
            throw err;
        }
        if (result.map != null) {
            let map = new (0, ($parcel$interopDefault($75ApV$parcelsourcemap)))(options.projectRoot);
            let rawMap = JSON.parse(result.map);
            map.addVLQMap({
                ...rawMap,
                sources: rawMap.sources.map((s)=>(0, ($parcel$interopDefault($75ApV$path))).relative(options.projectRoot, s))
            });
            asset.setMap(map);
        }
        asset.setCode(result.css);
        return [
            asset
        ];
    }
});
function $65be2ac9a55cf399$var$urlPlugin({ asset: asset  }) {
    return {
        install (less, pluginManager) {
            // This is a hack; no such interface exists, even conceptually, in Less.
            const visitor = new less.visitors.Visitor({
                visitUrl (node) {
                    const valueNode = node.value;
                    const stringValue = valueNode.value;
                    if (!stringValue.startsWith("#") // IE's `behavior: url(#default#VML)`)
                    ) valueNode.value = asset.addURLDependency(stringValue, {});
                    return node;
                }
            }); // $FlowFixMe[method-unbinding]
            visitor.run = visitor.visit;
            pluginManager.addVisitor(visitor);
        }
    };
}
function $65be2ac9a55cf399$var$resolvePathPlugin({ asset: asset , resolve: resolve  }) {
    return {
        install (less, pluginManager) {
            class LessFileManager extends less.FileManager {
                supports() {
                    return true;
                }
                supportsSync() {
                    return false;
                }
                async loadFile(rawFilename, currentDirectory, options) {
                    let filename = rawFilename;
                    if ($65be2ac9a55cf399$var$WEBPACK_ALIAS_RE.test(filename)) {
                        let correctPath = filename.replace(/^~/, "");
                        throw new Error(`The @import path "${filename}" is using webpack specific syntax, which isn't supported by Parcel.\n\nTo @import files from node_modules, use "${correctPath}"`);
                    } // Based on https://github.com/less/less.js/blob/master/packages/less/src/less-node/file-manager.js
                    let isAbsoluteFilename = this.isPathAbsolute(filename);
                    let paths = isAbsoluteFilename ? [
                        ""
                    ] : [
                        currentDirectory
                    ];
                    if (options.paths) paths.push(...options.paths);
                    let prefixes = options.prefixes || [
                        ""
                    ];
                    let fileParts = this.extractUrlParts(filename);
                    let filePath;
                    let contents;
                    if (filename[0] !== "~") outer: for (let p of paths)for (let prefix of prefixes){
                        filePath = fileParts.rawPath + prefix + fileParts.filename;
                        if (p) filePath = (0, ($parcel$interopDefault($75ApV$path))).join(p, filePath);
                        if (options.ext) filePath = this.tryAppendExtension(filePath, options.ext);
                        try {
                            contents = await asset.fs.readFile(filePath, "utf8");
                            break outer;
                        } catch (err) {
                            asset.invalidateOnFileCreate({
                                filePath: filePath
                            });
                        }
                    }
                    if (!contents) {
                        filePath = await resolve(asset.filePath, filename);
                        contents = await asset.fs.readFile(filePath, "utf8");
                    }
                    if (filePath) asset.invalidateOnFileChange(filePath);
                    return {
                        contents: contents,
                        filename: filePath
                    };
                }
            }
            pluginManager.addFileManager(new LessFileManager());
        }
    };
}


