"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newUser = newUser;
exports.loginUser = loginUser;
const userRepository_1 = require("../repositories/userRepository");
const customErrors_1 = require("../utils/customErrors");
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("util");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const pbkdf2 = (0, util_1.promisify)(crypto_1.default.pbkdf2);
async function hashPassword(password) {
    const salt = crypto_1.default.randomBytes(16).toString("hex");
    const ITERATIONS = 100_000;
    const KEY_LENGTH = 64;
    const DIGEST = "sha512";
    const derivedKey = await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
    const hash = derivedKey.toString("hex");
    return `${ITERATIONS}:${salt}:${hash}`;
}
async function newUser(user) {
    const existing = await (0, userRepository_1.getUserByEmail)(user.email);
    if (existing) {
        throw new customErrors_1.AppError("User already exists with this email id.", 400);
    }
    const hashedPassword = await hashPassword(user.password);
    return (0, userRepository_1.createUser)({
        name: user.name,
        email: user.email,
        introduction: user.introduction,
        domain: user.domain,
        preferredLanguage: user.preferredLanguage,
        currentLevel: user.currentLevel,
        topicsCovered: [],
        hashed_password: hashedPassword,
    });
}
async function loginUser(email, password) {
    const thisUser = await (0, userRepository_1.getUserByEmail)(email);
    if (!thisUser) {
        throw new customErrors_1.AppError("Invalid credentials.", 400);
    }
    const passwordMatch = await verifyPassword(password, thisUser.hashed_password);
    if (!passwordMatch) {
        throw new customErrors_1.AppError("Invalid credentials.", 400);
    }
    const jwtToken = await issueToken(thisUser.id, thisUser.email);
    return jwtToken;
}
function issueToken(userId, userEmail) {
    return jsonwebtoken_1.default.sign({ id: userId,
        email: userEmail,
    }, JWT_SECRET, { expiresIn: "1h" });
}
async function verifyPassword(password, stored) {
    const [iterationsStr, salt, originalHash] = stored.split(":");
    const iterations = parseInt(iterationsStr, 10);
    const KEY_LENGTH = 64;
    const DIGEST = "sha512";
    const derivedKey = await pbkdf2(password, salt, iterations, KEY_LENGTH, DIGEST);
    const computedHash = derivedKey.toString("hex");
    return crypto_1.default.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(computedHash, "hex"));
}
