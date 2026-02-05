import { client } from "@/sanity/lib/client";
import Link from "next/link";

// Yeh line ensure karti hai ke har baar fresh data fetch ho
export const revalidate = 0;

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
  // Query mein priceMode bhi fetch kar rahe hain for accuracy
  const HOME_PAGE_QUERY = `*[_type == "order"] | order(_createdAt desc) {
    orderNumber,
    status,
    total,
    priceMode,
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

    // Logic: Agar country Pakistan nahi hai ya priceMode 'intl' hai toh USD
    const isUSD = order.customer?.country?.toLowerCase() !== "pakistan";

    const orderItemsCount =
      order.items?.reduce(
        (acc: number, item: OrderItem) => acc + (item.quantity || 0),
        0,
      ) || 0;

    stats.totalItemsSold += orderItemsCount;

    if (!stats.byStatus[status]) {
      stats.byStatus[status] = { count: 0, items: 0, pkr: 0, usd: 0 };
    }

    stats.byStatus[status].count += 1;
    stats.byStatus[status].items += orderItemsCount;

    if (isUSD) {
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen font-sans text-left">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Store Analytics
          </h1>
          <p className="text-gray-500">Real-time Order Insights</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">
            System Status
          </span>
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Records
          </div>
        </div>
      </header>

      {/* ---------- STAT CARDS ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          color="border-blue-500"
        />
        <StatCard
          title="Total Items Sold"
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
      <section className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Status Breakdown</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
            Categorized by Currency
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Order Status</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">PKR Rev.</th>
                <th className="px-6 py-4 text-right border-l">USD Rev.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(stats.byStatus).length > 0 ? (
                Object.entries(stats.byStatus).map(([status, data]) => (
                  <tr
                    key={status}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusStyles(status)}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold">
                      {data.count}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {data.items}
                    </td>
                    <td className="px-6 py-4 text-right text-green-700 font-black">
                      {data.pkr > 0 ? `Rs. ${data.pkr.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-indigo-700 font-black border-l bg-indigo-50/5 group-hover:bg-indigo-50/20">
                      {data.usd > 0 ? `$${data.usd.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- RECENT ORDERS ---------- */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">
            Recent Transactions
          </h2>
          <Link
            href="/orders"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all hover:gap-2"
          >
            View All Orders <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.slice(0, 10).map((order) => {
            const isUSD = order.customer?.country?.toLowerCase() !== "pakistan";
            return (
              <div
                key={order.orderNumber}
                className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-inner ${isUSD ? "bg-indigo-50 text-indigo-600" : "bg-green-50 text-green-600"}`}
                  >
                    {isUSD ? "$" : "₨"}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight tracking-tight uppercase text-sm">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {order.customer?.fullName} <span className="mx-1">•</span>{" "}
                      {order.customer?.country}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-black leading-none mb-1 ${isUSD ? "text-indigo-600" : "text-green-600"}`}
                  >
                    {isUSD
                      ? `$${order.total}`
                      : `Rs. ${order.total?.toLocaleString()}`}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    {new Date(order._createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
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
    pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    paid: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    processing: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
    shipped: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
    completed: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  };
  return styles[status] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
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
    <div
      className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all`}
    >
      <div
        className={`absolute top-0 left-0 w-1.5 h-full ${color.replace("border-", "bg-")}`}
      ></div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-600 transition-colors">
        {title}
      </p>
      <p className="text-2xl font-black text-gray-900 tracking-tight">
        {value}
      </p>
    </div>
  );
}
