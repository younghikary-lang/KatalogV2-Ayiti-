import NextAuth from "next-auth";
import authConfig from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Identifiant", type: "text" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.username as string },
                            { phoneNumber: credentials.username as string },
                        ]
                    }
                });

                if (user && user.password) {
                    const isMatch = await bcrypt.compare(credentials.password as string, user.password);
                    if (isMatch) {
                        return { id: user.id, name: user.name, email: user.email, role: user.role };
                    }
                }

                return null;
            }
        })
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user }) {
            // Si c'est le super-admin, on force son rôle en base à chaque connexion
            // Personne d'autre ne peut avoir ce privilège.
            if (user.email === "young.hikary@gmail.com") {
                try {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { role: "admin" }
                    });
                    // @ts-expect-error: NextAuth types lack role default
                    user.role = "admin";
                } catch (e) {
                    console.error("Failed to force admin role during sign in:", e);
                }
            }
            return true;
        }
    }
});
