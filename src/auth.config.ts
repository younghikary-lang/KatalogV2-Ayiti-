import type { NextAuthConfig } from "next-auth";

export default {
    providers: [],
    session: { strategy: "jwt" },
    trustHost: true,
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                // @ts-expect-error: NextAuth types lack role default
                token.role = user.email === "young.hikary@gmail.com" ? 'admin' : (user.role || 'client');
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                // @ts-expect-error: NextAuth types lack role default
                session.user.role = (token.role as string) || 'client';
                session.user.id = (token.id as string) || (token.sub as string);
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
} satisfies NextAuthConfig;
