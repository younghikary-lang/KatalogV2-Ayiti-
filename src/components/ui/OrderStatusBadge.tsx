export function OrderStatusBadge({ status }: { status: string }) {
    let colorClass = "bg-gray-500/10 text-gray-500";
    let label = status;

    switch (status) {
        case "PENDING":
        case "PAYMENT_INITIATED":
            colorClass = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
            label = "EN ATTENTE";
            break;
        case "PAID":
        case "PAYMENT_CONFIRMED":
            colorClass = "bg-green-500/10 text-green-500 border border-green-500/20";
            label = "PAYÉE";
            break;
        case "SHIPPED":
        case "DISPATCHED":
            colorClass = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
            label = "EXPÉDIÉE";
            break;
        case "DELIVERED":
            colorClass = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
            label = "LIVRÉE";
            break;
        case "CANCELLED":
            colorClass = "bg-red-500/10 text-red-500 border border-red-500/20";
            label = "ANNULÉE";
            break;
        default:
            colorClass = "bg-gray-500/10 text-gray-400 border border-gray-500/20";
            break;
    }

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
            {label}
        </span>
    );
}
