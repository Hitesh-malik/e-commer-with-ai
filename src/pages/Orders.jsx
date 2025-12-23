import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Orders() {
  // ✅ dummy data (replace later with API)
  const orders = useMemo(
    () => [
      {
        id: "ORD052F01A370",
        customer: { name: "s", email: "s@gmail.com" },
        date: "23/12/2025",
        status: "PLACED",
        items: [{ title: "Laptop", qty: 1, price: 40000 }],
      },
      {
        id: "ORDF3F363647A",
        customer: { name: "s", email: "s@gmail.com" },
        date: "23/12/2025",
        status: "PLACED",
        items: [{ title: "Mouse", qty: 1, price: 999 }],
      },
    ],
    []
  );

  const [openId, setOpenId] = useState(orders?.[0]?.id ?? null);

  const count = orders.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <motion.h1
        className="text-2xl sm:text-3xl font-bold text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        Order Management
      </motion.h1>

      <motion.div
        className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg shadow-black/5 dark:shadow-black/30 overflow-hidden"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        {/* Top blue bar */}
        <div className="bg-blue-600 text-white px-4 sm:px-6 py-2 text-sm font-semibold">
          Orders ({count})
        </div>

        {/* Table header (desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
          <div className="col-span-3">Order ID</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Items</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {orders.map((o) => {
            const itemsCount = o.items.reduce((a, it) => a + it.qty, 0);
            const total = o.items.reduce((a, it) => a + it.qty * it.price, 0);
            const isOpen = openId === o.id;

            return (
              <div key={o.id} className="bg-white dark:bg-gray-900">
                {/* Row */}
                <div className="px-4 sm:px-6 py-4">
                  {/* Mobile card layout */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{o.id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {o.customer.name} • {o.customer.email}
                        </div>
                      </div>

                      <StatusPill status={o.status} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {o.date}
                      </span>
                      <span className="font-semibold">₹{formatMoney(total)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Items: {itemsCount}
                      </span>

                      <button
                        onClick={() => setOpenId(isOpen ? null : o.id)}
                        className="rounded-md px-3 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        {isOpen ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  {/* Desktop grid layout */}
                  <div className="hidden md:grid grid-cols-12 gap-2 items-center text-sm">
                    <div className="col-span-3 font-semibold">{o.id}</div>

                    <div className="col-span-3">
                      <div className="font-medium">{o.customer.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {o.customer.email}
                      </div>
                    </div>

                    <div className="col-span-2 text-gray-700 dark:text-gray-200">
                      {o.date}
                    </div>

                    <div className="col-span-1">
                      <StatusPill status={o.status} />
                    </div>

                    <div className="col-span-1 text-gray-700 dark:text-gray-200">
                      {itemsCount}
                    </div>

                    <div className="col-span-1 text-right font-semibold">
                      ₹{formatMoney(total)}
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => setOpenId(isOpen ? null : o.id)}
                        className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                          isOpen
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {isOpen ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable order items */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-5">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 overflow-hidden">
                          <div className="px-4 py-3 text-sm font-semibold">
                            Order Items
                          </div>

                          {/* items header */}
                          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-3">Quantity</div>
                            <div className="col-span-3 text-right">Price</div>
                          </div>

                          {/* items rows */}
                          {o.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-t border-gray-200 dark:border-gray-800"
                            >
                              <div className="col-span-6 font-medium">
                                {it.title}
                              </div>
                              <div className="col-span-3">{it.qty}</div>
                              <div className="col-span-3 text-right">
                                ₹{formatMoney(it.price * it.qty)}
                              </div>
                            </div>
                          ))}

                          {/* total row */}
                          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold bg-blue-50 dark:bg-blue-950/30 border-t border-gray-200 dark:border-gray-800">
                            <div className="col-span-9 text-right">Total</div>
                            <div className="col-span-3 text-right">
                              ₹{formatMoney(total)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "PLACED"
      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function formatMoney(n) {
  try {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return Number(n).toFixed(2);
  }
}
