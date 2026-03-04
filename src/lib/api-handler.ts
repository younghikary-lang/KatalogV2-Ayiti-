// src/lib/api-handler.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { rateLimiter, RateLimitConfig } from "./rate-limit";

// Custom error for rate limiting
export class RateLimitError extends Error {
    constructor(message = "Too Many Requests") {
        super(message);
        this.name = "RateLimitError";
    }
}

// Custom error for Auth/Permissions
export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export interface ApiHandlerConfig {
    rateLimit?: RateLimitConfig;
}

/**
 * Standard API Wrapper for Centralized Error Handling and Security
 * Enforces Rate Limiting, Zod Parsing errors, Prisma Constraints, and systematic logging.
 */
export function withErrorHandler(
    handler: (req: any, ...args: any[]) => Promise<NextResponse | Response>,
    config?: ApiHandlerConfig
) {
    return async (req: Request, ...args: any[]) => {
        try {
            // 1. Rate Limiting Check
            if (config?.rateLimit) {
                // Determine IP (Vercel forwards it in headers, fallback to a global IP for local dev)
                const forwardedFor = req.headers.get("x-forwarded-for");
                const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
                const endpoint = new URL(req.url).pathname;
                const rateLimitKey = `${ip}:${endpoint}`;

                const isLimited = await rateLimiter.isRateLimited(rateLimitKey, config.rateLimit);
                if (isLimited) {
                    throw new RateLimitError();
                }
            }

            // 2. Execute Handler
            return await handler(req, ...args);

        } catch (error: any) {
            // 3. Centralized Error Typing & Routing

            // Rate Limit hit
            if (error instanceof RateLimitError) {
                return NextResponse.json({ success: false, message: error.message }, { status: 429 });
            }

            // Auth failures
            if (error instanceof UnauthorizedError) {
                return NextResponse.json({ success: false, message: error.message }, { status: 401 });
            }

            // Zod Validation Failures
            if (error instanceof ZodError) {
                return NextResponse.json({
                    success: false,
                    message: "Validation Error",
                    errors: error.issues
                }, { status: 400 });
            }

            // Prisma Known Errors (Safe extraction without leaking DB schema)
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // P2002: Unique constraint violation
                if (error.code === 'P2002') {
                    console.warn(`[PRISMA CONFLICT] ${req.method} ${new URL(req.url).pathname}: Conflict on unique constraint`);
                    return NextResponse.json({ success: false, message: "A record with this value already exists." }, { status: 409 });
                }

                // Other generic Prisma constraint failures
                console.error(`[PRISMA ERROR] Code: ${error.code}`, error.message);
                return NextResponse.json({ success: false, message: "Database Operational Error." }, { status: 400 });
            }

            // Generic Fallback (500)
            console.error(`[CRITICAL API ERROR] ${req.method} ${req.url} -`, error);
            return NextResponse.json({
                success: false,
                message: "Internal Server Error"
            }, { status: 500 });
        }
    };
}
