import { OrderStatus } from "../types/order";

const StatusSelect = ({
  status,
  orderId,
  onUpdate,
}: {
  status: OrderStatus;
  orderId: string;
  onUpdate: (id: string, s: OrderStatus) => void;
}) => {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    processing: "bg-sky-100 text-sky-700 border-sky-200",
    shipped: "bg-violet-100 text-violet-700 border-violet-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const statuses: OrderStatus[] = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "completed",
    "cancelled",
  ];

  return (
    <select
      value={status}
      onChange={(e) => onUpdate(orderId, e.target.value as OrderStatus)}
      disabled={status === "completed"}
      className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider cursor-pointer outline-none transition-all ${styles[status]} ${
        status === "completed" ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {statuses.map((s) => (
        <option key={s} value={s} className="bg-white text-slate-900">
          {s}
        </option>
      ))}
    </select>
  );
};

export default StatusSelect;
