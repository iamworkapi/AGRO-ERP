import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";

// jti (JWT ID) is what makes real logout possible: authenticate.js checks
// it against RevokedToken on every request, and logout inserts it there.
// Without a per-token identifier, "revoke this session" would have no
// smaller unit to target than "rotate the signing secret and log everyone
// out everywhere."
export function signAccessToken(user) {
  const jti = crypto.randomUUID();
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, jti, tokenVersion: user.tokenVersion },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.secret);
}
