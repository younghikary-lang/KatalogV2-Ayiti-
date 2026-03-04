"use client";

import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CheckoutPage() {
    const { data: session } = useSession();
    const { items: cartItems, cartTotal, isHydrated, clearCart } = useCartStore();
    const { formatHTG, formatUSD, htgRate } = useCurrency();
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const idempotencyKeyRef = useRef((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));

    // Manual Payment States
    const [selectedPayment, setSelectedPayment] = useState('stripe');
    const [proofFile, setProofFile] = useState<string | null>(null);

    // Store step 1 data
    const [shippingData, setShippingData] = useState({
        address: '',
        department: '',
        phone: ''
    });

    const HAITI_DEPARTMENTS = ["Ouest", "Nord", "Nord-Est", "Nord-Ouest", "Artibonite", "Centre", "Sud", "Sud-Est", "Grand'Anse", "Nippes"];

    const t = useTranslations('Checkout');
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, [isHydrated, cartItems]);

    // Derived strictly from cart store methods
    const subtotal = cartTotal();
    const isMember = !!session?.user;
    const discount = isMember ? subtotal * 0.05 : 0;
    const tax = subtotal * 0.08;
    const total = (subtotal + tax) - discount;

    if (!mounted || !isHydrated) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
                <p className="mt-4 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Lock className="w-4 h-4" /> {t('secure')}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                {/* Forms Section */}
                <div className="flex-1 space-y-8">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-12 relative px-4">
                        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border z-0"></div>
                        <div className="absolute left-4 top-4 h-0.5 bg-accent z-0 transition-all duration-500" style={{ width: step === 1 ? '0%' : 'calc(100% - 2rem)' }}></div>

                        <div className={`relative z-10 flex flex-col items-center gap-2 ${step >= 1 ? 'text-accent' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-accent text-white ring-4 ring-[#0b1120]' : 'bg-muted text-muted-foreground'}`}>1</div>
                            <span className="text-xs font-medium bg-[#0b1120] px-2">{t('step1')}</span>
                        </div>
                        <div className={`relative z-10 flex flex-col items-center gap-2 ${step >= 2 ? 'text-accent' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-accent text-white ring-4 ring-[#0b1120]' : 'glass-surface text-muted-foreground ring-4 ring-[#0b1120]'}`}>2</div>
                            <span className="text-xs font-medium bg-[#0b1120] px-2">{t('step2')}</span>
                        </div>
                    </div>

                    {/* Step 1: Shipping */}
                    {step === 1 && (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const department = formData.get('department') as string;
                            const street = formData.get('street') as string;
                            const phone = formData.get('whatsapp') as string;

                            setShippingData({
                                address: `${street}, ${department}, Haiti`,
                                department: department,
                                phone: phone
                            });

                            setStep(2);
                        }} className="space-y-12">
                            {/* Contact Details */}
                            <section>
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">{t('contact')}</h2>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <input type="text" required placeholder={t('firstName')} className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent" />
                                        <input type="text" required placeholder={t('lastName')} className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent" />
                                    </div>
                                    <input type="email" placeholder={t('email')} className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent" />
                                    <input type="tel" name="whatsapp" required pattern="[0-9]+" title="Veuillez entrer uniquement des chiffres" placeholder={t('whatsapp')} className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent" />
                                </div>
                            </section>

                            {/* Shipping Address (Haïti) */}
                            <section>
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">{t('addressTitle')}</h2>
                                <div className="space-y-4">
                                    <select name="department" required defaultValue="" className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all text-foreground appearance-none cursor-pointer focus:border-transparent">
                                        <option value="" disabled className="bg-[#0f172a]">Sélectionnez votre département</option>
                                        {HAITI_DEPARTMENTS.map(dep => (
                                            <option key={dep} value={dep} className="bg-[#0f172a]">{dep}</option>
                                        ))}
                                    </select>
                                    <input type="text" name="street" required placeholder={t('street')} className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent" />
                                    <textarea
                                        name="instructions"
                                        required
                                        placeholder={t('instructions')}
                                        className="w-full h-24 p-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground resize-none focus:border-transparent"
                                    ></textarea>
                                </div>
                            </section>

                            <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-2xl bg-white text-black hover:bg-gray-200">
                                {t('continue')}
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsLoading(true);

                            // Get selected payment method
                            const formData = new FormData(e.currentTarget);
                            const paymentMethod = selectedPayment;

                            if ((paymentMethod === 'moncash' || paymentMethod === 'natcash') && !proofFile) {
                                toast.error("Veuillez télécharger une capture d'écran de votre paiement.");
                                setIsLoading(false);
                                return;
                            }

                            const itemsPayload = cartItems.map(item => ({
                                id: item.id,
                                quantity: item.quantity
                            }));

                            const manualPaymentDetails = (paymentMethod === 'moncash' || paymentMethod === 'natcash') ? {
                                transactionId: formData.get('transactionId') as string,
                                phone: formData.get('paymentPhone') as string,
                                proofUrl: proofFile || undefined
                            } : undefined;

                            const attemptOrder = async () => {
                                const response = await fetch('/api/checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        paymentMethod: paymentMethod === 'cod' ? 'CASH' : (paymentMethod === 'stripe' ? 'CARD' : 'MONCASH'),
                                        items: itemsPayload.map(i => ({ productId: i.id, quantity: i.quantity })),
                                        shippingAddress: shippingData.address,
                                        phoneNumber: shippingData.phone,
                                        idempotencyKey: idempotencyKeyRef.current,
                                        department: shippingData.department,
                                        manualPaymentDetails
                                    }),
                                });

                                const data = await response.json();
                                if (!response.ok) {
                                    throw new Error(data.message || "Failed to process checkout");
                                }
                                return data;
                            };

                            let res;
                            try {
                                res = await attemptOrder();
                            } catch (e: any) {
                                // First failure, let's retry silently
                                setIsRetrying(true);
                                await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s before retry
                                try {
                                    res = await attemptOrder();
                                } catch (e2: any) {
                                    res = { success: false, message: e2.message || "Retry failed" };
                                }
                                setIsRetrying(false);
                            }

                            if (res?.success) {
                                clearCart();
                                if (res.data?.checkoutUrl) {
                                    window.location.href = res.data.checkoutUrl;
                                } else {
                                    router.push('/success?tracking=' + (res.data?.publicTrackingToken || ''));
                                }
                            } else {
                                setIsLoading(false);
                                toast.error(res?.message || res?.error || "Une erreur inattendue s'est produite lors de la création de la commande.");
                            }
                        }} className="space-y-12">
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <button type="button" onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-white transition-colors underline underline-offset-4">
                                        {t('back')}
                                    </button>
                                </div>
                                <h2 className="text-2xl font-semibold mb-6">{t('paymentMethod')}</h2>
                                <div className="p-6 border border-white/5 rounded-2xl glass-surface space-y-6">
                                    <div className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPayment === 'cod' ? 'border-accent bg-accent/5' : 'border-white/5 hover:border-white/20'}`} onClick={() => setSelectedPayment('cod')}>
                                        <div className="flex items-center gap-4">
                                            <input type="radio" id="cod" name="payment" value="cod" checked={selectedPayment === 'cod'} readOnly className="w-5 h-5 accent-accent" />
                                            <label htmlFor="cod" className="font-medium text-lg cursor-pointer">Paiement à la livraison</label>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPayment === 'stripe' ? 'border-accent bg-accent/5' : 'border-white/5 hover:border-white/20'}`} onClick={() => setSelectedPayment('stripe')}>
                                        <div className="flex items-center gap-4">
                                            <input type="radio" id="stripe" name="payment" value="stripe" checked={selectedPayment === 'stripe'} readOnly className="w-5 h-5 accent-accent" />
                                            <label htmlFor="stripe" className="font-medium text-lg cursor-pointer flex flex-col">
                                                <span>Carte Bancaire (Stripe)</span>
                                                <span className="text-xs text-muted-foreground">Paiement 100% sécurisé</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPayment === 'moncash' ? 'border-accent bg-accent/5' : 'border-white/5 hover:border-white/20'}`} onClick={() => setSelectedPayment('moncash')}>
                                        <div className="flex items-center gap-4">
                                            <input type="radio" id="moncash" name="payment" value="moncash" checked={selectedPayment === 'moncash'} readOnly className="w-5 h-5 accent-accent" />
                                            <label htmlFor="moncash" className="font-medium text-lg cursor-pointer flex flex-col">
                                                <span>MonCash <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full ml-2">POPULAIRE</span></span>
                                                <span className="text-xs text-muted-foreground">Digicel Mobile Money</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPayment === 'natcash' ? 'border-accent bg-accent/5' : 'border-white/5 hover:border-white/20'}`} onClick={() => setSelectedPayment('natcash')}>
                                        <div className="flex items-center gap-4">
                                            <input type="radio" id="natcash" name="payment" value="natcash" checked={selectedPayment === 'natcash'} readOnly className="w-5 h-5 accent-accent" />
                                            <label htmlFor="natcash" className="font-medium text-lg cursor-pointer flex flex-col">
                                                <span>NatCash <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">PRINCIPAL</span></span>
                                                <span className="text-xs text-muted-foreground">Natcom Mobile Money</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Manual Payment Fields */}
                                    {(selectedPayment === 'moncash' || selectedPayment === 'natcash') && (
                                        <div className="mt-6 p-6 bg-black/40 rounded-xl space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <div className={`p-4 rounded-xl ${selectedPayment === 'moncash' ? 'bg-[#ff6a00]' : 'bg-[#1e40af]'} text-white flex flex-col items-center justify-center text-center shadow-lg`}>
                                                <p className="text-sm font-medium mb-1">Envoyer à ce numéro :</p>
                                                <p className="text-3xl font-bold tracking-wider">+509 44 XX XXXX</p>
                                                <p className="text-xs mt-1 font-medium opacity-80">KATALOG BOUTIK HAITI</p>
                                            </div>

                                            <div className="text-center bg-[#1d1d1f] p-4 rounded-xl border border-white/10">
                                                <p className="text-sm text-muted-foreground">Montant exact à payer :</p>
                                                <p className="text-2xl font-bold font-mono mt-2 text-white">{formatHTG(total)}</p>
                                                <p className="text-xs text-accent mt-2 font-medium">Soit {formatUSD(total)} au total</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">(Taux appliqué : 1 USD = 135 HTG)</p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/10">
                                                <h3 className="text-sm font-semibold">Après avoir effectué le transfert :</h3>
                                                <input type="text" name="transactionId" required placeholder="ID / Code de transaction" className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent font-mono" />
                                                <input type="tel" name="paymentPhone" required placeholder="Numéro de téléphone utilisé" className="w-full h-12 px-4 rounded-xl border border-white/10 bg-transparent focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground focus:border-transparent" />

                                                <div className="pt-2">
                                                    <p className="text-sm mb-2 font-medium">Preuve de paiement :</p>
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden">
                                                        {proofFile ? (
                                                            <div className="absolute inset-0 p-2">
                                                                <img src={proofFile} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <svg className="w-8 h-8 mb-3 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                                </svg>
                                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-accent">Cliquez pour télécharger</span> un screenshot</p>
                                                                <p className="text-xs text-muted-foreground">PNG, JPG ou PDF</p>
                                                            </div>
                                                        )}
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                if (file.size > 5 * 1024 * 1024) return toast.error("Le fichier est trop volumineux (5MB max)");
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setProofFile(reader.result as string);
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                            <Button type="submit" disabled={isLoading || isRetrying} size="lg" className="btn-primary w-full text-lg h-14 rounded-2xl shadow-lg shadow-accent/20">
                                {isRetrying ? 'Tentative de reconnexion...' : isLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Traitement sécurisé...</span>
                                    </span>
                                ) : t('confirm')}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:w-[450px]">
                    <div className="bg-muted/30 rounded-3xl p-8 sticky top-24">
                        <h2 className="text-2xl font-semibold mb-8">{t('summary')}</h2>

                        <div className="space-y-6 mb-8">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-20 h-20 bg-white dark:bg-[#1d1d1f] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                                        <Image src={item.image} alt={item.name} fill priority sizes="80px" className="object-contain p-2" />
                                        <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-6 h-6 flex items-center justify-center rounded-full z-10">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="font-medium text-foreground text-sm line-clamp-2">{item.name}</h4>
                                        <p className="text-muted-foreground text-sm">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t border-border pt-6 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('subtotal')}</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            {isMember && (
                                <div className="flex justify-between text-green-500">
                                    <span>Rabais Membre VIP (5%)</span>
                                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('shipping')}</span>
                                <span className="font-medium">{t('freeShipping')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('tax')}</span>
                                <span className="font-medium">${tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col border-t border-border mt-6 pt-6 gap-2">
                            <div className="flex justify-between text-xl font-bold">
                                <span>{t('total')}</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            {!isMember && (
                                <p className="text-sm text-accent/80 font-medium text-right animate-pulse">
                                    Connexion = -5% de rabais 🎁
                                </p>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground text-center mt-6">
                            {t('terms')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
