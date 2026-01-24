import { client } from "@/sanity/lib/client";
import React from "react";

/* ----------------------------- Types ----------------------------- */

interface OrderItem {
  quantity: number;
  price: number;
  productName: string;
}

interface Order {
  orderNumber: string;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled";
  total: number;
  customer: {
    country: string;
    fullName: string;
    email?: string;
  };
  items: OrderItem[];
  _createdAt: string;
}

interface StatusStats {
  count: number;
  items: number;
  pkr: number;
  usd: number;
}

/* ----------------------------- Data Fetching ------------------------- */

async function getDashboardData() {
  const HOME_PAGE_QUERY = `*[_type == "order"] | order(_createdAt desc) {
    orderNumber,
    status,
    total,
    customer {
      country,
      fullName
    },
    items[] {
      quantity,
      price,
      "productName": product->name
    },
    _createdAt
  }`;

  const orders: Order[] = await client.fetch(HOME_PAGE_QUERY);

  const stats = {
    totalOrders: orders.length,
    totalItemsSold: 0,
    revenuePKR: 0,
    revenueUSD: 0,
    byStatus: {} as Record<string, StatusStats>,
  };

  orders.forEach((order) => {
    const status = order.status || "pending";
    const isInternational =
      order.customer?.country?.toLowerCase() !== "pakistan";

    const orderItemsCount =
      order.items?.reduce(
        (acc: number, item: OrderItem) => acc + item.quantity,
        0,
      ) || 0;

    stats.totalItemsSold += orderItemsCount;

    if (!stats.byStatus[status]) {
      stats.byStatus[status] = { count: 0, items: 0, pkr: 0, usd: 0 };
    }

    stats.byStatus[status].count += 1;
    stats.byStatus[status].items += orderItemsCount;

    if (isInternational) {
      stats.revenueUSD += order.total || 0;
      stats.byStatus[status].usd += order.total || 0;
    } else {
      stats.revenuePKR += order.total || 0;
      stats.byStatus[status].pkr += order.total || 0;
    }
  });

  return { orders, stats };
}

/* ----------------------------- Components ------------------------- */

export default async function AdminHomePage() {
  const { orders, stats } = await getDashboardData();

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Store Analytics
          </h1>
          <p className="text-gray-500">Dual-Currency Order Management</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 uppercase">
            System Status
          </span>
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>
      </header>

      {/* ---------- STAT CARDS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          color="border-blue-500"
        />
        <StatCard
          title="Items Shipped"
          value={stats.totalItemsSold}
          color="border-orange-500"
        />
        <StatCard
          title="Revenue (PKR)"
          value={`Rs. ${stats.revenuePKR.toLocaleString()}`}
          color="border-green-600"
        />
        <StatCard
          title="Revenue (USD)"
          value={`$${stats.revenueUSD.toLocaleString()}`}
          color="border-indigo-600"
        />
      </div>

      {/* ---------- BREAKDOWN TABLE ---------- */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            Status & Price Mode Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Order Status</th>
                <th className="px-6 py-4">Count</th>
                <th className="px-6 py-4">Total Items</th>
                <th className="px-6 py-4 text-right">PKR Mode</th>
                <th className="px-6 py-4 text-right border-l">USD Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(stats.byStatus).map(([status, data]) => (
                <tr
                  key={status}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyles(status)}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {data.count}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{data.items}</td>
                  <td className="px-6 py-4 text-right text-green-700 font-bold">
                    Rs. {data.pkr.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-indigo-700 font-bold border-l bg-indigo-50/10">
                    ${data.usd.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- RECENT ORDERS ---------- */}
      <section>
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Recent Transactions
        </h2>
        <div className="grid gap-4">
          {orders.slice(0, 8).map((order) => {
            const isUSD = order.customer?.country?.toLowerCase() !== "pakistan";
            return (
              <div
                key={order.orderNumber}
                className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isUSD ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}
                  >
                    {isUSD ? "$" : "₨"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.fullName} • {order.customer?.country}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-black ${isUSD ? "text-indigo-600" : "text-green-600"}`}
                  >
                    {isUSD
                      ? `$${order.total}`
                      : `Rs. ${order.total?.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-gray-400 italic">
                    {new Date(order._createdAt).toDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ----------------------------- Helpers ------------------------- */

function getStatusStyles(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    processing: "bg-orange-100 text-orange-700",
    shipped: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-b-4 ${color}`}>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}
