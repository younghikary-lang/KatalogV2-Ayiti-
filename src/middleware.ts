import NextAuth from "next-auth";
import authConfig from "./auth.config";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    // @ts-expect-error: NextAuth types do not include role property by default
    const userRole = req.auth?.user?.role;

    const pathname = nextUrl.pathname;
    const isAdminPath = pathname.match(/^\/(fr|ht)?\/?admin/);
    const isDriverPath = pathname.match(/^\/(fr|ht)?\/?driver/);
    const isAccountPath = pathname.match(/^\/(fr|ht)?\/?account/);

    const localeMatch = pathname.match(/^\/(fr|ht)/);
    const currentLocale = localeMatch ? localeMatch[1] : 'fr';

    const isMasterAdmin = isLoggedIn && req.auth?.user?.email === "young.hikary@gmail.com";

    // 1. Protection du Dashboard Admin
    if (isAdminPath) {
        if (!isMasterAdmin) {
            return Response.redirect(new URL(`/${currentLocale}/login`, nextUrl));
        }
    }

    // 2. Protection du Dashboard Driver
    if (isDriverPath) {
        if (!isLoggedIn || (userRole !== 'driver' && !isMasterAdmin)) {
            return Response.redirect(new URL(`/${currentLocale}/login?callbackUrl=/${currentLocale}/driver`, nextUrl));
        }
    }

    // 3. Protection du Compte Client
    if (isAccountPath) {
        if (!isLoggedIn) {
            return Response.redirect(new URL(`/${currentLocale}/login?callbackUrl=/${currentLocale}/account`, nextUrl));
        }
    }

    return intlMiddleware(req);
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(fr|ht)/:path*']
};
