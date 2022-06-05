"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const tc = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const rest_1 = require("@octokit/rest");
const yaml_1 = __importDefault(require("yaml"));
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
            this.binPath = path_1.default.join(tc.find('argocd', params.version), 'argocd');
            core.info(`argo bin path: ${this.binPath}`);
            try {
                yield (0, promises_1.access)(this.binPath);
                // core.addPath(this.binPath);
                core.debug(`Found "argocd" executable at: ${this.binPath}`);
            }
            catch (e) {
                core.debug('Unable to find "argocd" executable, downloading it now');
                yield this.download(params.version);
            }
            return this.getVersion();
        });
    }
    getVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            let version = '';
            yield exec.exec(this.binPath, [
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
                version: yaml_1.default.parse(version.replace(/^\s+/gm, '')),
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
                core.setFailed(`Action failed with error ${err}`);
                return '';
            }
        });
    }
    download(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.getExecutableUrl(version);
            core.debug(`[debug()] getExecutableUrl: ${url}`);
            const exe = process.platform === 'win32' ? 'argocd.exe' : 'argocd';
            const asset = path_1.default.join(os_1.default.homedir(), exe);
            const assetPath = yield tc.downloadTool(url, asset);
            const cachedPath = yield tc.cacheFile(assetPath, exe, 'argocd', version);
            core.addPath(cachedPath);
            this.binPath = path_1.default.join(cachedPath, exe);
            yield (0, promises_1.chmod)(this.binPath, 0o755);
        });
    }
}
exports.InstallManager = InstallManager;
