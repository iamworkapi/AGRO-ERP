import mongoose from "mongoose";

// Backs real server-side logout. JWTs are otherwise stateless and valid
// until they expire on their own - without this, "logout" would only ever
// mean "the frontend forgot its copy," and a stolen/leaked token would go
// on working normally. Each entry is looked up by jti in authenticate.js;
// the TTL index lets Mongo delete rows itself once the token they refer to
// would have expired anyway, so this collection can never grow unbounded.
const revokedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);
