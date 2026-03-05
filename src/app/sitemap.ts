import { MetadataRoute } from 'next';
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://katalog.ht';

    // Resolve dynamic product catalogs
    const products = await prisma.product.findMany({
        select: { id: true, updatedAt: true }
    });

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/fr/product/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    return [
        {
            url: `${baseUrl}/fr`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/fr/category/all`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...productUrls,
    ];
}
