"use client";

import { useState } from "react";
import { Settings, Save, AlertCircle, RefreshCw } from "lucide-react";
import { updateHtgRate } from "@/app/actions/settings";
import { toast } from "sonner";
import { useCurrency, useSettingsStore } from "@/lib/currency";

export function SettingsList({ currentRate }: { currentRate: number }) {
    const [rate, setRate] = useState(currentRate.toString());
    const [isSaving, setIsSaving] = useState(false);

    // Also update the local Client store so UI reflects instantly without full page reload
    const setHtgRate = useSettingsStore(state => state.setHtgRate);

    const handleSave = async () => {
        const numRate = parseFloat(rate);
        if (isNaN(numRate) || numRate <= 0) {
            toast.error("Veuillez entrer un taux valide supérieur à 0.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await updateHtgRate(numRate);
            if (res.success) {
                setHtgRate(numRate); // Sync client side instantly
                toast.success(`Taux HTG mis à jour : 1 USD = ${numRate} HTG`);
            } else {
                toast.error("Erreur lors de la mise à jour en base de données.");
            }
        } catch (error) {
            toast.error("Une erreur serveur est survenue.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#1d1d1f] p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-foreground">Paramètres Généraux</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Configuration système</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white font-medium shadow-md hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
            </div>

            <div className="bg-white dark:bg-[#1d1d1f] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    Taux de Change Dynamique (USD / HTG)
                </h3>

                <div className="max-w-md space-y-4">
                    <div className="p-4 bg-muted/30 rounded-2xl border border-white/5">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Taux actuel appliqué sur le site</label>
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-foreground px-4 py-3 bg-background rounded-xl border border-border">1 USD</span>
                            <span className="text-muted-foreground font-medium">=</span>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    className="w-full h-14 pl-4 pr-12 rounded-xl border border-white/10 bg-background focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent font-bold text-lg"
                                    placeholder="Ex: 135.0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">HTG</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                            Ce taux est utilisé pour convertir les prix USD du catalogue en Gourdes Haïtiennes (HTG) pour les méthodes de paiements locales (MonCash, NatCash). Il s'applique instantanément à tout le site dès l'enregistrement.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
