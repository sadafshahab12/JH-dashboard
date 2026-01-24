"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import {
  FileText,
  Download,
  Search,
  Calendar,
  Eye,
  Copy,
  Trash2,
  X,
  ExternalLink,
  Package,
  User,
  MapPin,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";
import { CurrencyMode } from "../types/order";

/* -------------------- TYPES -------------------- */
type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";
type OrderSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  customization?: string;
}

interface OrderProduct {
  _id: string;
  name: string;
  slug: { current: string };
  baseImage?: { asset: { url: string } };
}

interface OrderItem {
  product: OrderProduct;
  variantId: string;
  size: OrderSize;
  color: string;
  colorCode: string;
  quantity: number;
  price: number;
  priceMode: CurrencyMode;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  currencyMode: CurrencyMode;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  _createdAt: string;
  payment?: {
    receipt?: {
      asset?: {
        url?: string;
      };
    };
  };
}

const ORDERS_QUERY = groq`
*[_type == 'order'] | order(_createdAt desc){
  _id,
  orderNumber,
  _createdAt,
  status,
  subtotal,
  shippingFee,
  total,
  currencyMode,
  customer,
  payment{
    receipt{
      asset->{url}
    }
  },
  items[] {
    variantId,
    size,
    color,
    colorCode,
    quantity,
    price,
    priceMode,
    product->{
      _id,
      name,
      slug,
      baseImage{asset->{url}}
    }
  }
}`;

/* -------------------- UI COMPONENTS -------------------- */

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

/* -------------------- MODALS -------------------- */

const ProductViewModal = ({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                Items Summary
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-1 uppercase tracking-tight">
                ID: {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm"
            >
              <div className="relative w-full sm:w-24 h-40 sm:h-24 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-50">
                {item.product.baseImage?.asset?.url ? (
                  <Image
                    src={item.product.baseImage.asset.url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-[10px] font-bold">
                    NO IMAGE
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-slate-900 text-base leading-tight mb-2 sm:mb-0">
                    {item.product.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase">
                      Size: {item.size}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase">
                      Qty: {item.quantity}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                      <div
                        className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
                        style={{ backgroundColor: item.colorCode }}
                      ></div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {item.color}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex justify-between items-end border-t sm:border-none pt-3 sm:pt-0 border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Unit Price
                  </p>
                  <p className="font-black text-indigo-600 text-lg">
                    {item.priceMode === "intl" ? "$" : "PKR"}{" "}
                    {item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-6 border-t bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">
              Total Items:
            </span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-black">
              {order.items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const ReceiptModal = ({
  url,
  orderNumber,
  onClose,
}: {
  url: string;
  orderNumber: string;
  onClose: () => void;
}) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `receipt-${orderNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-emerald-500" /> Payment
            Evidence
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 bg-slate-100 flex justify-center max-h-[60vh] overflow-auto">
          <Image
            src={url}
            alt="Receipt"
            width={800}
            height={800}
            className="max-w-full h-auto rounded-lg shadow-lg ring-4 ring-white"
          />
        </div>
        <div className="p-5 border-t bg-white flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
          >
            <div className="p-1 bg-white/20 rounded-lg" title="SAVE RECEIPT">
              <Download size={18} />
            </div>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- MAIN PAGE -------------------- */

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewProductsOrder, setViewProductsOrder] = useState<Order | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    client.fetch<Order[]>(ORDERS_QUERY).then(setOrders);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const text = search.toLowerCase();
      const matchText =
        order.customer.fullName.toLowerCase().includes(text) ||
        order.customer.email.toLowerCase().includes(text) ||
        order.orderNumber.toLowerCase().includes(text);

      const created = new Date(order._createdAt).getTime();

      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

      const matchStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return (
        matchText &&
        (!from || created >= from) &&
        (!to || created <= to) &&
        matchStatus
      );
    });
  }, [orders, search, fromDate, toDate, statusFilter]);
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const clearAllFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  const copyOrder = async (order: Order) => {
    const currencySymbol = order.currencyMode === "intl" ? "$" : "PKR";

    const itemDetails = order.items
      .map(
        (item) =>
          `- ${item.product.name} [${item.size}/${item.color}]\n  ${item.quantity} x ${item.priceMode === "intl" ? "$" : "PKR"}${item.price.toFixed(2)} = ${item.priceMode === "intl" ? "$" : "PKR"}${(item.quantity * item.price).toFixed(2)}`,
      )
      .join("\n");

    const receiptText =
      `ORDER RECEIPT: #${order.orderNumber}\nDate: ${new Date(order._createdAt).toLocaleDateString("en-GB")}\n---------------------------\nCUSTOMER:\nName: ${order.customer.fullName}\nEmail: ${order.customer.email}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}, ${order.customer.city}, ${order.customer.country}\n${order.customer.customization ? `Note: ${order.customer.customization}` : ""}\n\nITEMS:\n${itemDetails}\n\n---------------------------\nTOTAL: ${currencySymbol} ${order.total.toFixed(2)}\nStatus: ${order.status.toUpperCase()}`.trim();

    await navigator.clipboard.writeText(receiptText);
    alert("Receipt text copied!");
  };

  const deleteOrder = async (id: string) => {
    const ok = confirm(
      "Delete this order permanently? This action cannot be undone.",
    );
    if (!ok) return;

    const response = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (data.success) {
      setOrders((prev) => prev.filter((o) => o._id !== id));
      alert("Order deleted successfully.");
    } else {
      alert(data.message);
    }
  };
  const updateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch("/api/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        // Update local state so UI updates instantly
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, status: newStatus } : order,
          ),
        );
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const tableColumn = [
      "Order #",
      "Date",
      "Customer",
      "Address",
      "Products",
      "Total",
      "Status",
    ];
    const tableRows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o._createdAt).toLocaleDateString("en-GB"),
      `${o.customer.fullName}\n${o.customer.email}`,
      o.customer.address,
      o.items.map((i) => i.product.name).join(", "),
      `${o.currencyMode === "intl" ? "$" : "PKR"} ${o.total.toFixed(2)}`,
      o.status.toUpperCase(),
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`Orders_Report.pdf`);
  };

  const downloadExcel = () => {
    const reportData = filteredOrders.map((o) => ({
      "Order Number": o.orderNumber,
      Date: new Date(o._createdAt).toLocaleDateString("en-GB"),
      Status: o.status.toUpperCase(),
      // Customer Details
      "Customer Name": o.customer.fullName,
      Email: o.customer.email,
      Phone: o.customer.phone,
      Country: o.customer.country,
      City: o.customer.city,
      "Full Address": o.customer.address,
      "Customization Note": o.customer.customization || "None",
      // Product Details (Flat string for Excel compatibility)
      Products: o.items
        .map(
          (i) =>
            `${i.product.name} (Size: ${i.size}, Color: i.color}, Price: ${i.price} Qty: ${i.quantity})`,
        )
        .join(" | "),
      // Financials
      Subtotal: o.subtotal,
      Shipping: o.shippingFee,
      "Total Amount": `${o.currencyMode === "intl" ? "$" : "PKR"} ${o.total}`,
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);

    // Optional: Set column widths for better readability
    const wscols = [
      { wch: 15 }, // Order Number
      { wch: 12 }, // Date
      { wch: 12 }, // Status
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Country
      { wch: 15 }, // City
      { wch: 30 }, // Full Address
      { wch: 20 }, // Customization
      { wch: 50 }, // Products
      { wch: 10 }, // Subtotal
      { wch: 10 }, // Shipping
      { wch: 12 }, // Total Amount
    ];
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detailed Orders Report");
    XLSX.writeFile(
      wb,
      `Store_Orders_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 pb-24 md:p-10 font-sans text-slate-900">
      {selectedOrder?.payment?.receipt?.asset?.url && (
        <ReceiptModal
          url={selectedOrder.payment.receipt.asset.url}
          orderNumber={selectedOrder.orderNumber}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {viewProductsOrder && (
        <ProductViewModal
          order={viewProductsOrder}
          onClose={() => setViewProductsOrder(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Order Management
            </h1>
            <p className="text-slate-500 font-medium">
              Manage, track, and export your store transactions effortlessly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <FileText size={18} className="text-rose-500" /> PDF
            </button>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Download size={18} className="text-emerald-400" /> Export Excel
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 items-end">
          {/* Search Bar - Spans 2 columns on large screens, full width on mobile */}
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Search Orders
              </label>
              {(search || fromDate || toDate) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] flex items-center gap-1 font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase"
                >
                  <RotateCcw size={10} /> Clear All
                </button>
              )}
            </div>
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                placeholder="Search by customer, email..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 rounded-xl outline-none transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* From Date */}
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
              From Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
              <input
                type="date"
                value={fromDate}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 rounded-xl outline-none transition-all text-sm"
                onChange={(e) => setFromDate(e.target.value)}
              />
              {fromDate && (
                <button
                  onClick={() => setFromDate("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* To Date */}
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
              To Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
              <input
                type="date"
                value={toDate}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 rounded-xl outline-none transition-all text-sm"
                onChange={(e) => setToDate(e.target.value)}
              />
              {toDate && (
                <button
                  onClick={() => setToDate("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Status - Full width on mobile/tablet, 1 col on desktop */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "all")
              }
              className="w-full px-3 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 rounded-xl outline-none transition-all text-sm appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Order Details
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Customer Info
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Destination
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Amount
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      #{order.orderNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      {new Date(order._createdAt).toLocaleDateString("en-GB")}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-none">
                          {order.customer.fullName}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {order.customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-2 max-w-45">
                      <MapPin
                        size={14}
                        className="mt-0.5 text-slate-400 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {order.customer.city}, {order.customer.country}
                        </div>
                        <div
                          className="text-[10px] text-slate-400 mt-0.5 truncate"
                          title={order.customer.address}
                        >
                          {order.customer.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-sm text-slate-900">
                    {order.currencyMode === "intl" ? "$" : "PKR"}{" "}
                    {order.total.toFixed(2)}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <StatusSelect
                      status={order.status}
                      orderId={order._id}
                      onUpdate={updateOrderStatus}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewProductsOrder(order)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="View Items"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => copyOrder(order)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                        title="Copy Receipt Text"
                      >
                        <Copy size={17} />
                      </button>
                      {order.payment?.receipt?.asset?.url && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="View Payment Proof"
                        >
                          <ExternalLink size={17} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-xl px-3 py-2"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
              >
                Prev
              </button>

              <span className="font-bold">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Next
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium">
              No orders found matching your criteria.
            </div>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden space-y-4">
          {paginatedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      #{order.orderNumber}
                    </p>
                    <h3 className="font-bold text-slate-900">
                      {order.customer.fullName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {new Date(order._createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  {/* ... existing card header ... */}
                  <StatusSelect
                    status={order.status}
                    orderId={order._id}
                    onUpdate={updateOrderStatus}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Total
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {order.currencyMode === "intl" ? "$" : "PKR"}{" "}
                    {order.total.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Items
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {order.items.length} Products
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewProductsOrder(order)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-100"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => copyOrder(order)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-100"
                >
                  <Copy size={14} />
                </button>
                {order.payment?.receipt?.asset?.url && (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteOrder(order._id)}
                  className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-xl px-3 py-2"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
              >
                Prev
              </button>

              <span className="font-bold">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
