import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { AppError } from "../utils/errors.js";

const rounds = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 12));

export async function register({ name, email, password }) {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!cleanName) throw new AppError("Name is required.");
  if (cleanName.length > 100) throw new AppError("Name must be 100 characters or fewer.");
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new AppError("Please enter a valid email address.");
  if (typeof password !== "string" || password.length < 8)
    throw new AppError("Password must be at least 8 characters long.");
  if (password.length > 72) throw new AppError("Password must be 72 characters or fewer.");
  const passwordHash = await bcrypt.hash(password, rounds);
  try {
    const { rows } = await query(
      "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email",
      [cleanName, cleanEmail, passwordHash],
    );
    return rows[0];
  } catch (error) {
    if (error.code === "23505")
      throw new AppError("An account with this email already exists.", 409);
    throw error;
  }
}

export async function login({ email, password }) {
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!cleanEmail || typeof password !== "string" || !password) {
    throw new AppError("Email and password are required.");
  }
  const { rows } = await query("SELECT id,name,email,password_hash FROM users WHERE email=$1", [
    cleanEmail,
  ]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError("Invalid email or password.", 401);
  }
  return { id: user.id, name: user.name, email: user.email };
}

export function createToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}
