"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Identifiants incorrects. Veuillez réessayer.");
            } else {
                router.push(callbackUrl);
            }
        } catch {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    const autofill = (user: string, pass: string) => {
        setUsername(user);
        setPassword(pass);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 glass-surface p-10 rounded-3xl border border-white/10">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-6">
                        <Lock className="w-8 h-8 text-accent" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Connexion</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Accédez à votre espace sécurisé
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Identifiant</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent"
                                placeholder="Email ou Numéro WhatsApp"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Mot de passe</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="btn-primary w-full text-lg h-14 rounded-2xl">
                        {isLoading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-background text-muted-foreground">Ou continuer avec</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => signIn('google', { callbackUrl })}
                            className="flex items-center justify-center w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={() => signIn('apple', { callbackUrl })}
                            className="flex items-center justify-center w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.29-.88 3.57-.84 1.51.15 2.67.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.84 2.15-1.57 4.15-2.53 5.1zm-3.41-14c-.03-1.74 1.35-3.5 3.34-3.79.35 1.8-.83 3.65-3.34 3.79z" />
                            </svg>
                            Apple
                        </button>
                    </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                    <button onClick={() => router.push('/register')} className="w-full h-12 mb-6 font-medium text-foreground hover:text-accent transition-colors">
                        Pas encore de compte ? Créer un compte
                    </button>
                </div>
            </div>
        </div>
    );
}
