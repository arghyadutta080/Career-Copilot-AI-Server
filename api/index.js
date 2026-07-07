"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = __importDefault(require("../src/app"));
const db_1 = require("../src/config/db");
const graphql_1 = require("../src/graphql");
let isInitialized = false;
const initServer = async () => {
    if (!isInitialized) {
        await (0, db_1.connectDB)();
        await (0, graphql_1.setupGraphQL)(app_1.default);
        isInitialized = true;
    }
};
async function handler(req, res) {
    await initServer();
    return (0, app_1.default)(req, res);
}
