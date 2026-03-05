import { handlers } from "@/auth"
import { withErrorHandler } from "@/lib/api-handler";

const AUTH_RATE_LIMIT = { limit: 30, windowMs: 60000 };

export const GET = withErrorHandler(async (req: any) => handlers.GET(req), { rateLimit: AUTH_RATE_LIMIT });
export const POST = withErrorHandler(async (req: any) => handlers.POST(req), { rateLimit: AUTH_RATE_LIMIT });
