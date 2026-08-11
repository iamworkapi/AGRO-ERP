import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { authLimiter, otpRequestLimiter } from "../middleware/rateLimiters.js";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);

router.post("/forgot-password", otpRequestLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;
