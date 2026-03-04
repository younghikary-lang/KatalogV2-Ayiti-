"use client";

import { useState } from "react";
import { Package, Plus, Edit2, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatHTG, formatUSD } from "@/lib/currency";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CategoryProps {
    id: string;
    name: string;
}

interface ProductProps {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    categoryRef: CategoryProps;
    stock: number;
    isNew: boolean;
    createdAt: Date;
    image: string;
}

export function ProductsList({ initialProducts, categories }: { initialProducts: ProductProps[], categories: CategoryProps[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const payload = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: Number(formData.get("price")),
            stock: Number(formData.get("stock")),
            categoryId: formData.get("categoryId"),
            image: formData.get("image") || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            isNew: formData.get("isNew") === "on"
        };

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success("Produit ajouté avec succès");
                setProducts([data.data, ...products]);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(data.message || "Erreur lors de l'ajout");
            }
        } catch (error) {
            toast.error("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#1d1d1f] p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{products.length}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Produits en Base</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm shadow-md hover:bg-accent/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Ajouter
                </button>
            </div>

            {/* Product Table */}
            <div className="bg-white dark:bg-[#1d1d1f] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produit</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prix</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catégorie</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-contain bg-gray-100 dark:bg-black/50 p-1" />
                                            <div>
                                                <p className="font-semibold text-foreground line-clamp-1">{product.name}</p>
                                                {product.isNew && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Nouveau</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{formatUSD(product.price)}</span>
                                            <span className="text-xs text-muted-foreground">~ {formatHTG(product.price)}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : product.stock > 0 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                                            {product.stock} dispo
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-medium text-muted-foreground capitalize">{product.categoryRef?.name || 'Inconnue'}</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                                        {format(new Date(product.createdAt), "dd MMM yyyy", { locale: fr })}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 hover:text-foreground transition-colors" title="Supprimer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1d1d1f] w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-foreground">Ajouter un produit</h2>

                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Nom du Produit</label>
                                <input name="name" required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground" placeholder="Ex: iPhone 15 Pro" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Catégorie</label>
                                <select name="categoryId" required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground capitalize">
                                    <option value="" disabled selected>Sélectionnez une catégorie (Relationnelle)</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Prix (USD)</label>
                                    <input type="number" step="0.01" name="price" required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground" placeholder="Ex: 999.99" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Stock Initial</label>
                                    <input type="number" name="stock" required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground" defaultValue="10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea name="description" required rows={3} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground" placeholder="Description détaillée..." />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                                    <input type="checkbox" name="isNew" className="w-4 h-4 rounded" defaultChecked />
                                    Marquer comme "Nouveau"
                                </label>
                                <button disabled={isLoading} type="submit" className="bg-accent text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:bg-accent/90 disabled:opacity-50">
                                    {isLoading ? "Enregistrement..." : "Créer le Produit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
