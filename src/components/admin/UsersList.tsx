"use client";

import { useState } from "react";
import { User, Shield, Truck, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    active: boolean;
    createdAt: Date;
}

export function UsersList({
    initialUsers,
    clientCount,
    driverCount
}: {
    initialUsers: UserData[];
    clientCount: number;
    driverCount: number;
}) {
    const [users, setUsers] = useState(initialUsers);

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="bg-white dark:bg-[#1d1d1f] flex-1 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{clientCount}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clients Inscrits</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1d1d1f] flex-1 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{driverCount}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Livreurs Actifs</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1d1d1f] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle & Accès</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscription</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-gray-600 dark:text-white/50 font-bold uppercase">
                                                {user.name ? user.name.slice(0, 2) : '??'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{user.name || 'Sans nom'}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                    <Shield className="w-3.5 h-3.5" /> Administrateur
                                                </span>
                                            ) : user.role === 'driver' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                                                    <Truck className="w-3.5 h-3.5" /> Livreur
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                                                    <User className="w-3.5 h-3.5" /> Client
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {user.active ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Actif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Suspendu
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                                        {format(new Date(user.createdAt), "dd MMM yyyy", { locale: fr })}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 hover:text-foreground transition-colors" title="Modifier">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Bannir">
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
        </div>
    );
}
