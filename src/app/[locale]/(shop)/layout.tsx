import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { auth } from "@/auth";

export default async function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <div className="mx-auto w-full max-w-7xl flex flex-col min-h-screen relative">
            <Navbar session={session} />
            <main className="flex-1 w-full">
                {children}
            </main>
            <Footer />
            <CartDrawer />
        </div>
    );
}
