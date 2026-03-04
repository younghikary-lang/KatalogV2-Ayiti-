import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from '@/i18n/routing';
import { getTranslations } from "next-intl/server";

export default async function SuccessPage({
    searchParams
}: {
    searchParams: { tracking?: string }
}) {
    const t = await getTranslations('Success');
    const params = await searchParams; // Next 15 resolution
    const trackingToken = params.tracking;

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center pb-24">
            <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">{t('title')}</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-12">
                Votre paiement a été traité avec succès. Préparez-vous à recevoir votre commande !
            </p>

            {trackingToken ? (
                <div className="w-full max-w-sm mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Link href={`/track/${trackingToken}`} className="w-full block">
                        <Button size="lg" className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-accent/20">
                            Suivre ma commande 📦
                        </Button>
                    </Link>
                    <Link href="/" className="w-full block">
                        <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl border-white/10 hover:bg-white/5">
                            Retour à la boutique
                        </Button>
                    </Link>
                </div>
            ) : (
                <Link href="/">
                    <Button size="lg" className="rounded-2xl h-14 px-8">
                        {t('back')}
                    </Button>
                </Link>
            )}

            {/* Guest Conversion Seduction Banner */}
            <div className="bg-[#1d1d1f] border border-white/5 rounded-3xl p-8 max-w-lg mx-auto w-full mt-12 text-left shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-foreground">Gagnez du temps la prochaine fois !</h3>
                <ul className="space-y-3 mb-8 font-medium text-sm text-muted-foreground">
                    <li className="flex items-center gap-3"><span className="text-xl opacity-80">📱</span> Suivi SMS en temps réel</li>
                    <li className="flex items-center gap-3"><span className="text-xl opacity-80">⚡</span> Checkout express</li>
                    <li className="flex items-center gap-3"><span className="text-xl opacity-80">🎁</span> Programme de fidélité</li>
                </ul>
                <Link href="/login" className="w-full block">
                    <Button variant="secondary" className="w-full h-12 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10">
                        Créer un compte client
                    </Button>
                </Link>
            </div>
        </div>
    );
}
