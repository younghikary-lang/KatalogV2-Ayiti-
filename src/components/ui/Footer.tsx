import { Link } from '@/i18n/routing';

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-muted/30">
            <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Boutique</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/category/vetements" className="hover:text-accent transition-colors">Vêtements</Link></li>
                            <li><Link href="/category/chaussures" className="hover:text-accent transition-colors">Chaussures</Link></li>
                            <li><Link href="/category/accessoires" className="hover:text-accent transition-colors">Accessoires</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Service Client</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/support" className="hover:text-accent transition-colors">Besoin d'aide ?</Link></li>
                            <li><Link href="/support/returns" className="hover:text-accent transition-colors">Retours</Link></li>
                            <li><Link href="/profile/orders" className="hover:text-accent transition-colors">Suivi de commande</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Compte</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-accent transition-colors">Se connecter</Link></li>
                            <li><Link href="/register" className="hover:text-accent transition-colors">Créer un compte</Link></li>
                            <li><Link href="/profile" className="hover:text-accent transition-colors">Ouvrir mon profil</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">À propos</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-accent transition-colors">Notre Histoire</Link></li>
                            <li><Link href="/about/careers" className="hover:text-accent transition-colors">Carrières</Link></li>
                            <li><Link href="/about/terms" className="hover:text-accent transition-colors">Conditions Générales</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} Katalog Ayiti Inc. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms of Use</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Sales Policy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Legal</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Site Map</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
