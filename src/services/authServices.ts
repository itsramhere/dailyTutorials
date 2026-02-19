import { createUser, getUserByEmail } from '../repositories/userRepository';
import { signupUser } from '../utils/types';
import { AppError } from '../utils/customErrors';
import { User } from '@prisma/client';
import crypto from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

const pbkdf2 = promisify(crypto.pbkdf2);

async function hashPassword(password: string): Promise<string>{
  const salt = crypto.randomBytes(16).toString("hex");
  const ITERATIONS = 100_000;
  const KEY_LENGTH = 64;
  const DIGEST = "sha512";

  const derivedKey = await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  const hash = derivedKey.toString("hex");
  return `${ITERATIONS}:${salt}:${hash}`;
}

export async function newUser(user: signupUser): Promise<User>{
  const existing = await getUserByEmail(user.email);

  if (existing) {
    throw new AppError("User already exists with this email id.", 400);
  }

  const hashedPassword = await hashPassword(user.password);

  return createUser({
    name: user.name,
    email: user.email,
    introduction: user.introduction,
    domain: user.domain,
    preferredLanguage: user.preferredLanguage,
    currentLevel: user.currentLevel,
    topicsCovered: [],
    hashed_password: hashedPassword,
    role: user.role || 'user'
  });
}

export async function loginUser(email: string, password: string): Promise<string>{
    const thisUser = await getUserByEmail(email);
    if(!thisUser){
        throw new AppError("Invalid credentials.", 400);
    }
    const passwordMatch = await verifyPassword(password, thisUser.hashed_password);
    if(!passwordMatch){
        throw new AppError("Invalid credentials.", 400);
    }
    const jwtToken = issueToken(thisUser.id, thisUser.email);
    return jwtToken;
}

function issueToken(userId: string, userEmail:string): string {
  return jwt.sign(
    {id: userId,
     email: userEmail,
    },        
    JWT_SECRET,            
    { expiresIn: "1h" }    
  )
}

async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {

  const [iterationsStr, salt, originalHash] = stored.split(":");
  const iterations = parseInt(iterationsStr, 10);

  const KEY_LENGTH = 64;
  const DIGEST = "sha512";

  const derivedKey = await pbkdf2(
    password,
    salt,
    iterations,
    KEY_LENGTH,
    DIGEST
  )

  const computedHash = derivedKey.toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(originalHash, "hex"),
    Buffer.from(computedHash, "hex")
  );
}
