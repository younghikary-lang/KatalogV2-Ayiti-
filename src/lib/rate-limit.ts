// src/lib/rate-limit.ts

export interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

export interface IRateLimiter {
    isRateLimited(key: string, config: RateLimitConfig): Promise<boolean>;
}

// Fallback in-memory implementation for SQLite/VPS deployments
// Will be wiped on Serverless cold starts, but provides basic protection
export class MemoryRateLimiter implements IRateLimiter {
    private hits = new Map<string, { count: number; resetTime: number }>();

    async isRateLimited(key: string, config: RateLimitConfig): Promise<boolean> {
        const now = Date.now();
        const record = this.hits.get(key);

        if (!record) {
            this.hits.set(key, { count: 1, resetTime: now + config.windowMs });
            return false;
        }

        if (now > record.resetTime) {
            // Window expired, reset
            this.hits.set(key, { count: 1, resetTime: now + config.windowMs });
            return false;
        }

        if (record.count >= config.limit) {
            return true; // Rate limited
        }

        record.count += 1;
        return false;
    }

    // Help prevent memory leaks if used in a long-running process
    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.hits.entries()) {
            if (now > record.resetTime) {
                this.hits.delete(key);
            }
        }
    }
}

// Singleton export
export const rateLimiter: IRateLimiter = new MemoryRateLimiter();

// Clean up memory every hour (only matters closely for VPS, not serverless)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        if (rateLimiter instanceof MemoryRateLimiter) {
            rateLimiter.cleanup();
        }
    }, 60 * 60 * 1000);
}
