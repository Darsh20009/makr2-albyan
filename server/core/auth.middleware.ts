import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "./errors";
import { createHmac } from "node:crypto";

function signingSecret(kind: "access" | "refresh"): string {
  const explicit = process.env[kind === "access" ? "JWT_SECRET" : "JWT_REFRESH_SECRET"];
  if (explicit && explicit.length >= 32) return explicit;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) throw new Error("Secure token signing is not configured");
  return createHmac("sha256", sessionSecret).update(`albayan-jwt-${kind}`).digest("hex");
}

export interface JwtPayload {
  userId: string;
  role: string;
  email?: string;
  mobile?: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, signingSecret("access"), { expiresIn: "15m", algorithm: "HS256" });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, signingSecret("refresh"), { expiresIn: "7d", algorithm: "HS256" });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, signingSecret("access"), { algorithms: ["HS256"] }) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, signingSecret("refresh"), { algorithms: ["HS256"] }) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    // Check JWT first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      (req as any).jwtUser = payload;
      (req as any).currentUser = payload;
      return next();
    }

    // Check cookie
    const cookieToken = req.cookies?.accessToken;
    if (cookieToken) {
      const payload = verifyAccessToken(cookieToken);
      (req as any).jwtUser = payload;
      (req as any).currentUser = payload;
      return next();
    }

    // Fallback to Passport session auth (backward compat)
    if (req.isAuthenticated && req.isAuthenticated()) {
      const user = req.user as any;
      (req as any).currentUser = {
        userId: user._id?.toString() || user.id?.toString(),
        role: user.role,
        email: user.email,
        mobile: user.mobile,
      };
      return next();
    }

    throw new UnauthorizedError();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ message: err.message, success: false });
    } else {
      res.status(401).json({ message: "رمز المصادقة غير صحيح أو منتهي الصلاحية", success: false });
    }
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Try JWT user first
    const currentUser = (req as any).currentUser || (req as any).jwtUser;

    if (currentUser && roles.includes(currentUser.role)) {
      return next();
    }

    // Fallback to Passport user
    if (req.isAuthenticated && req.isAuthenticated()) {
      const user = req.user as any;
      if (roles.includes(user.role)) {
        return next();
      }
    }

    res.status(403).json({ message: "ليس لديك صلاحية لتنفيذ هذا الإجراء", success: false });
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      (req as any).jwtUser = payload;
      (req as any).currentUser = payload;
    } else if (req.isAuthenticated && req.isAuthenticated()) {
      const user = req.user as any;
      (req as any).currentUser = {
        userId: user._id?.toString() || user.id?.toString(),
        role: user.role,
      };
    }
  } catch {
    // Ignore errors for optional auth
  }
  next();
}
