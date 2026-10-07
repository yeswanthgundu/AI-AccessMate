import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../database/db.js";
import { generateToken } from "../middleware/auth.js";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Valid email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  ability_profile: z.string().default("default"),
  preferred_language: z.string().default("English"),
});

const loginSchema = z.object({
  email: z.string().email("Valid email is required."),
  password: z.string().min(1, "Password is required."),
});

export async function register(req, res) {
  try {
    const validated = registerSchema.parse(req.body);

    const existing = await db.getUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(validated.password, salt);

    const user = await db.createUser({
      name: validated.name,
      email: validated.email,
      password_hash,
      ability_profile: validated.ability_profile,
      preferred_language: validated.preferred_language,
    });

    const token = generateToken(user);
    const preferences = await db.getPreferencesByUserId(user.id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ability_profile: user.ability_profile,
        preferred_language: user.preferred_language,
      },
      preferences,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.errors.map((e) => e.message).join(", "),
      });
    }
    console.error("Register Error:", err);
    return res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
    });
  }
}

export async function login(req, res) {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await db.getUserByEmail(validated.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const token = generateToken(user);
    const preferences = await db.getPreferencesByUserId(user.id);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ability_profile: user.ability_profile,
        preferred_language: user.preferred_language,
      },
      preferences,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.errors.map((e) => e.message).join(", "),
      });
    }
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      error: "Authentication failed. Please check credentials.",
    });
  }
}
