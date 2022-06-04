"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallManager = void 0;
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const tool_cache_1 = __importDefault(require("@actions/tool-cache"));
const core_1 = __importDefault(require("@actions/core"));
const exec_1 = __importDefault(require("@actions/exec"));
const rest_1 = require("@octokit/rest");
const interfaces_1 = require("../../interfaces");
const base_1 = require("../base");
const interfaces_2 = require("./interfaces");
class InstallManager extends base_1.BaseManager {
    constructor() {
        super(...arguments);
        this.binPath = '';
    }
    get action() {
        return interfaces_1.Actions.install;
    }
    run(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params.version) {
                throw new Error('version parameter is required');
            }
            this.binPath = tool_cache_1.default.find('argocd', params.version);
            try {
                yield (0, promises_1.access)(this.binPath, fs_1.constants.R_OK);
                core_1.default.addPath(this.binPath);
                core_1.default.debug(`Found "argocd" executable at: ${this.binPath}`);
            }
            catch (e) {
                core_1.default.debug('Unable to find "argocd" executable, downloading it now');
                yield this.download(params.version);
            }
            return this.getVersion();
        });
    }
    getVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            let version = '';
            yield exec_1.default.exec(this.binPath, [
                'version',
                '--client'
            ], {
                listeners: {
                    stdout: (buffer) => {
                        version += buffer.toString();
                    },
                },
            });
            return {
                version,
            };
        });
    }
    getExecutableUrl(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const octokit = new rest_1.Octokit({});
            const executable = interfaces_2.Executable[process.platform];
            try {
                const releases = yield octokit.repos.getReleaseByTag({
                    owner: 'argoproj',
                    repo: 'argo-cd',
                    tag: `v${version}`,
                });
                const [asset] = releases
                    .data
                    .assets
                    .filter((rel) => rel.name === executable);
                return asset.browser_download_url;
            }
            catch (err) {
                core_1.default.setFailed(`Action failed with error ${err}`);
                return '';
            }
        });
    }
    download(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.getExecutableUrl(version);
            core_1.default.debug(`[debug()] getExecutableUrl: ${url}`);
            const exe = process.platform === 'win32' ? 'argocd.exe' : 'argocd';
            const asset = path_1.default.join(os_1.default.homedir(), exe);
            const assetPath = yield tool_cache_1.default.downloadTool(url, asset);
            const cachedPath = yield tool_cache_1.default.cacheFile(assetPath, exe, 'argocd', version);
            core_1.default.addPath(cachedPath);
            this.binPath = path_1.default.join(cachedPath, exe);
            yield (0, promises_1.chmod)(this.binPath, 0o755);
        });
    }
}
exports.InstallManager = InstallManager;
