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
exports.LoginManager = void 0;
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
const interfaces_1 = require("../../interfaces");
const base_1 = require("../base");
class LoginManager extends base_1.BaseManager {
    get action() {
        return interfaces_1.Actions.login;
    }
    run(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params.ip) {
                throw new Error('ip parameter is required');
            }
            if (!params.port) {
                throw new Error('port parameter is required');
            }
            if (!params.username) {
                throw new Error('username parameter is required');
            }
            if (!params.password) {
                throw new Error('password parameter is required');
            }
            const agent = new https_1.default.Agent({
                rejectUnauthorized: false,
            });
            const res = yield axios_1.default.post(`https://${params.ip}:${params.port}/api/v1/session`, {
                username: params.username,
                password: params.password
            }, {
                httpsAgent: agent,
            });
            if (res.status !== 200) {
                throw new Error('Invalid request');
            }
            return {
                token: res.data.token,
            };
        });
    }
}
exports.LoginManager = LoginManager;
