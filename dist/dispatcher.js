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
exports.Dispatcher = void 0;
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const core = __importStar(require("@actions/core"));
const install_1 = require("./managers/install");
const login_1 = require("./managers/login");
const creation_1 = require("./managers/project/creation");
class Dispatcher {
    constructor(params) {
        this.params = params;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Dispatcher');
            // await this.initHandlers();
            this.init();
            const handler = Dispatcher.handlers[this.params.action];
            if (!handler) {
                return;
            }
            const result = yield handler.run(this.params);
            Object.entries(result)
                .forEach(([key, value]) => core.setOutput(key, value.toString()));
        });
    }
    static register(action, manger) {
        Dispatcher.handlers[action] = manger;
    }
    init() {
        new install_1.InstallManager();
        new login_1.LoginManager();
        new creation_1.ProjectCreationManager();
    }
    initHandlers() {
        return __awaiter(this, void 0, void 0, function* () {
            const rootPath = path_1.default.resolve(path_1.default.join(__dirname, 'managers'));
            const files = yield new Promise((resolve, reject) => {
                (0, glob_1.default)('**/index.@(ts|js)', {
                    cwd: rootPath,
                    ignore: 'base.@(ts|js)',
                }, (err, items) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(items);
                });
            });
            yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const Class = yield Dispatcher.load(path_1.default.join(rootPath, file));
                new Class();
            })));
        });
    }
    static load(managerPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const loaded = yield Promise.resolve().then(() => __importStar(require(managerPath)));
            const className = Object.keys(loaded)
                .filter((key) => key)
                .pop();
            return loaded[className];
        });
    }
}
exports.Dispatcher = Dispatcher;
Dispatcher.handlers = {};
