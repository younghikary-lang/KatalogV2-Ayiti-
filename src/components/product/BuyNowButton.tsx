"use client";

import { Button } from "@/components/ui/Button";
import { Product, useCartStore } from "@/lib/store";
import { useRouter } from "@/i18n/routing";

interface BuyNowButtonProps extends React.ComponentProps<typeof Button> {
    product: Product;
}

export function BuyNowButton({ product, children, ...props }: BuyNowButtonProps) {
    const addItem = useCartStore((state) => state.addItem);
    const router = useRouter();

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        router.push("/checkout");
    };

    return (
        <Button onClick={handleBuyNow} {...props}>
            {children}
        </Button>
    );
}
