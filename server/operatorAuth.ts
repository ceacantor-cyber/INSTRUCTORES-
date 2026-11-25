import crypto from "node:crypto";
import type { Request, Response } from "express";
import { parse } from "cookie";

export const OPERATOR_COOKIE = "cea_operator_session";

function sessionToken() {
  const secret = process.env.OPERATOR_PASSWORD;
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update("cea-cantor-operator-v1").digest("hex");
}

export function isOperatorRequest(req: Request) {
  const token = sessionToken();
  if (!token) return false;
  const cookies = parse(req.headers.cookie ?? "");
  const candidate = cookies[OPERATOR_COOKIE];
  if (!candidate || candidate.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(token));
}

function cookieOptions(req: Request) {
  const isPreviewHttps = Boolean(process.env.MANUS_PROJECT_ID) || req.get("x-forwarded-proto") === "https";
  return {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: isPreviewHttps,
    sameSite: (isPreviewHttps ? "none" : "lax") as "none" | "lax",
  };
}

function serializeOperatorCookie(value: string, options: ReturnType<typeof cookieOptions>) {
  const parts = [`${OPERATOR_COOKIE}=${encodeURIComponent(value)}`, `Path=${options.path}`, `Max-Age=${options.maxAge}`, "HttpOnly"];
  if (options.secure) parts.push("Secure");
  parts.push(`SameSite=${options.sameSite === "none" ? "None" : "Lax"}`);
  return parts.join("; ");
}

export function setOperatorSession(req: Request, res: Response) {
  const token = sessionToken();
  if (!token) throw new Error("Operator secret is not configured");
  res.setHeader("Set-Cookie", serializeOperatorCookie(token, cookieOptions(req)));
}

export function clearOperatorSession(req: Request, res: Response) {
  res.setHeader("Set-Cookie", serializeOperatorCookie("", { ...cookieOptions(req), maxAge: 0 }));
}

export function verifyOperatorPassword(password: string) {
  const expected = process.env.OPERATOR_PASSWORD;
  if (!expected || password.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}
