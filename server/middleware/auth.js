import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "accessmate_super_secret_jwt_key_2026_secure!";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication token required. Please sign in.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id: ..., email: ..., ability_profile: ... }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: "Session expired or invalid token. Please log in again.",
    });
  }
}

export function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      ability_profile: user.ability_profile || "default",
      role: "authenticated",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
