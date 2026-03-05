"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { client } from "@/sanity/lib/client";
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
  RotateCcw,
} from "lucide-react";
import { Order, OrderStatus, ProductType } from "../types/order";
import StatusSelect from "../components/StatusSelect";
import ProductViewModal from "../components/ProductViewModal";
import ReceiptModal from "../components/ReceiptModal";
import { ORDERS_QUERY } from "../queries/orderQuery";

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
  const [typeFilter, setTypeFilter] = useState<ProductType>("all");
  useEffect(() => {
    client.fetch<Order[]>(ORDERS_QUERY).then(setOrders);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const text = search.toLowerCase();

      // 1. Text Search (Customer Name, Email, Order #, and Product Name)
      const matchText =
        order.customer.fullName.toLowerCase().includes(text) ||
        order.customer.email.toLowerCase().includes(text) ||
        order.orderNumber.toLowerCase().includes(text) ||
        order.items.some((item) =>
          item.product.name.toLowerCase().includes(text),
        );

      // 2. Date Filtering
      const created = new Date(order._createdAt).getTime();
      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

      // 3. Status Filtering
      const matchStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      const matchType =
        typeFilter === "all"
          ? true
          : order.items.some((item) => item.productType === typeFilter);

      return (
        matchText &&
        (!from || created >= from) &&
        (!to || created <= to) &&
        matchStatus &&
        matchType
      );
    });
  }, [orders, search, fromDate, toDate, statusFilter, typeFilter]);
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
          `- ${item.product.name} [${item.productType === "stationery" ? item.pageType : item.size}/${item.color}]\n  ${item.quantity} x ${item.priceMode === "intl" ? "$" : "PKR"}${item.price.toFixed(2)} = ${item.priceMode === "intl" ? "$" : "PKR"}${(item.quantity * item.price).toFixed(2)}`,
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
      "Type", // Naya Column
      "Products",
      "Total",
      "Status",
    ];

    const tableRows = filteredOrders.map((o) => {
      // Unique product types nikalne ke liye
      const types = Array.from(new Set(o.items.map((i) => i.productType))).join(
        ", ",
      );

      return [
        o.orderNumber,
        new Date(o._createdAt).toLocaleDateString("en-GB"),
        `${o.customer.fullName}\n${o.customer.email}`,
        types.toUpperCase(), // Yahan type display hoga
        o.items
          .map((i) => `${i.product.name} (${i.size || i.pageType || "N/A"})`)
          .join(", "),
        `${o.currencyMode === "intl" ? "$" : "PKR"} ${o.total.toFixed(2)}`,
        o.status.toUpperCase(),
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      columnStyles: {
        3: { cellWidth: 25 },
        4: { cellWidth: 50 },
      },
    });

    doc.save(`Orders_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const downloadExcel = () => {
    const reportData = filteredOrders.map((o) => ({
      "Order Number": o.orderNumber,
      Date: new Date(o._createdAt).toLocaleDateString("en-GB"),
      Status: o.status.toUpperCase(),
      "Order Category": Array.from(new Set(o.items.map((i) => i.productType)))
        .join(", ")
        .toUpperCase(),
      "Customer Name": o.customer.fullName,
      Email: o.customer.email,
      Phone: o.customer.phone,
      Country: o.customer.country,
      City: o.customer.city,
      "Full Address": o.customer.address,
      "Customization Note": o.customer.customization || "None",
      Products: o.items
        .map(
          (i) =>
            `${i.product.name} [${i.productType}] (${i.size ? `Size: ${i.size}` : ""}${i.pageType ? `Pages: ${i.pageType}` : ""}, Color: ${i.color}, Price: ${i.price}, Qty: ${i.quantity})`,
        )
        .join(" | "),
      Subtotal: o.subtotal,
      Shipping: o.shippingFee,
      "Total Amount": `${o.currencyMode === "intl" ? "$" : "PKR"} ${o.total}`,
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);

    // Column widths update (added one for Category)
    const wscols = [
      { wch: 15 }, // Order Number
      { wch: 12 }, // Date
      { wch: 12 }, // Status
      { wch: 18 }, // Order Category (Naya column)
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Country
      { wch: 15 }, // City
      { wch: 30 }, // Full Address
      { wch: 20 }, // Customization
      { wch: 60 }, // Products
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
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 items-end">
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
          {/* Product Type Filter */}
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
              Category
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ProductType)}
              className="w-full px-3 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 rounded-xl outline-none transition-all text-sm appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="apparel">Apparel</option>
              <option value="mug">Mugs</option>
              <option value="stationery">Stationery</option>
            </select>
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
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-left min-w-300">
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
                  Sub Total
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Shipping
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Amount
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Product Type
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

                  {/* Customer Info */}
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

                  {/* FIXED: Destination / Address Cell */}
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-2 max-w-50">
                      {" "}
                      {/* Set a specific max width */}
                      <MapPin
                        size={14}
                        className="mt-0.5 text-slate-400 shrink-0"
                      />
                      <div className="overflow-hidden">
                        {" "}
                        {/* Container for truncation */}
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {order.customer.city}, {order.customer.country}
                        </div>
                        <div
                          className="text-[10px] text-slate-400 mt-0.5 "
                          title={order.customer.address}
                        >
                          {order.customer.address}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rest of the columns... */}
                  <td className="px-6 py-5 text-center">
                    <div className="text-xs font-bold text-slate-500">
                      PKR {order.subtotal?.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-xs font-bold text-slate-500">
                      {order.currencyMode === "intl" ? "$" : "PKR"}{" "}
                      {order.shippingFee?.toFixed(2) || "0.00"}
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
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(
                        new Set(order.items.map((i) => i.productType)),
                      ).map((type) => (
                        <span
                          key={type}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                            type === "apparel"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : type === "stationery"
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : "bg-purple-50 text-purple-600 border-purple-100"
                          }`}
                        >
                          {type || "N/A"}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {/* Action buttons stay as they are */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewProductsOrder(order)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => copyOrder(order)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                      >
                        <Copy size={17} />
                      </button>
                      {order.payment?.receipt?.asset?.url && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <ExternalLink size={17} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* 1. Header: Order ID & Status */}
              <div className="p-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      #{order.orderNumber}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {new Date(order._createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
                <StatusSelect
                  status={order.status}
                  orderId={order._id}
                  onUpdate={updateOrderStatus}
                />
              </div>

              {/* 2. Customer, Address & Items Info */}
              <div className="p-4 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {" "}
                  {/* min-w-0 allows the address to truncate properly */}
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {order.customer.fullName}
                  </h3>
                  {/* ADDED ADDRESS SECTION */}
                  <div className="flex items-start gap-1 mt-1 text-slate-500">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-tight line-clamp-2">
                      {order.customer.city}, {order.customer.address}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(
                      new Set(order.items.map((i) => i.productType)),
                    ).map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    Items
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {order.items.length} Products
                  </p>
                </div>
              </div>

              {/* 3. Pricing Card (Full Width) */}
              <div className="px-4 pb-2">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-bold uppercase">
                      Subtotal
                    </span>
                    <span className="text-slate-700 font-bold">
                      {order.currencyMode === "intl" ? "$" : "PKR"}{" "}
                      {order.subtotal?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-bold uppercase">
                      Shipping
                    </span>
                    <span className="text-emerald-600 font-bold">
                      +{order.currencyMode === "intl" ? "$" : "Rs"}{" "}
                      {order.shippingFee}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 my-1" />
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Final Amount
                      </p>
                      <p className="text-lg font-black text-indigo-600">
                        {order.currencyMode === "intl" ? "$" : "PKR"}{" "}
                        {order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-slate-200 shadow-sm text-right">
                      <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">
                        Method
                      </p>
                      <p className="text-[10px] font-black text-slate-700 uppercase">
                        {order.payment?.method || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Action Buttons */}
              <div className="p-4 grid grid-cols-4 gap-2">
                <button
                  onClick={() => setViewProductsOrder(order)}
                  className="flex items-center justify-center py-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => copyOrder(order)}
                  className="flex items-center justify-center py-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100"
                >
                  <Copy size={16} />
                </button>
                {order.payment?.receipt?.asset?.url ? (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-center py-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"
                  >
                    <ExternalLink size={16} />
                  </button>
                ) : (
                  <div className="flex items-center justify-center py-2.5 bg-slate-50 text-slate-300 rounded-xl border border-slate-100 cursor-not-allowed">
                    <ExternalLink size={16} />
                  </div>
                )}
                <button
                  onClick={() => deleteOrder(order._id)}
                  className="flex items-center justify-center py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Section fix */}
          <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Rows per page
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold outline-none"
              >
                {[5, 10, 20, 50].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 px-4 rounded-xl bg-slate-100 font-bold text-xs disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-xs font-black text-slate-900">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs"
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
