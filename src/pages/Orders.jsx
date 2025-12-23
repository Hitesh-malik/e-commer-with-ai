import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function Orders() {
  const baseUrl = import.meta.env.VITE_BASE_URL ?? "http://localhost:8080";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        setError("");
        setLoading(true);

        const res = await axios.get(`${baseUrl}/orders`);
        if (!mounted) return;

        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.log(e);
        if (mounted) setError("Failed to fetch orders. Please try again later.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => (mounted = false);
  }, [baseUrl]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  // Your backend uses item.totalPrice in list
  const calculateOrderTotal = (items = []) =>
    items.reduce((sum, it) => sum + Number(it.totalPrice || 0), 0);

  const statusPill = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const count = useMemo(() => orders.length, [orders]);

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

      {/* Loading */}
      {loading && (
        <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent dark:border-gray-700 dark:border-t-transparent" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Loading orders...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-8 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Main */}
      {!loading && !error && (
        <motion.div
          className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg shadow-black/5 dark:shadow-black/30 overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          {/* Top bar */}
          <div className="bg-blue-600 text-white px-4 sm:px-6 py-3 text-sm font-semibold">
            Orders ({count})
          </div>

          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
            <div className="col-span-3">Order ID</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Items</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Empty */}
          {orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-600 dark:text-gray-300">
              No orders found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {orders.map((order) => {
                const isOpen = expandedOrder === order.orderId;
                const itemsCount = order.items?.length ?? 0;
                const total = calculateOrderTotal(order.items);

                return (
                  <div key={order.orderId}>
                    {/* Row */}
                    <div className="px-4 sm:px-6 py-4">
                      {/* Mobile card view */}
                      <div className="md:hidden space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">
                              {order.orderId}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.customerName} • {order.email}
                            </div>
                          </div>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString()
                              : "-"}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(total)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Items: {itemsCount}
                          </span>

                          <button
                            onClick={() => toggleOrderDetails(order.orderId)}
                            className="rounded-md px-3 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                          >
                            {isOpen ? "Hide Details" : "View Details"}
                          </button>
                        </div>
                      </div>

                      {/* Desktop grid view */}
                      <div className="hidden md:grid grid-cols-12 gap-2 items-center text-sm">
                        <div className="col-span-3 font-semibold">
                          {order.orderId}
                        </div>

                        <div className="col-span-3">
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.email}
                          </div>
                        </div>

                        <div className="col-span-2 text-gray-700 dark:text-gray-200">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString()
                            : "-"}
                        </div>

                        <div className="col-span-1">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="col-span-1 text-gray-700 dark:text-gray-200">
                          {itemsCount}
                        </div>

                        <div className="col-span-1 text-right font-semibold">
                          {formatCurrency(total)}
                        </div>

                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => toggleOrderDetails(order.orderId)}
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

                    {/* Expand details */}
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

                              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-3">Quantity</div>
                                <div className="col-span-3 text-right">Price</div>
                              </div>

                              {(order.items || []).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-t border-gray-200 dark:border-gray-800"
                                >
                                  <div className="col-span-6 font-medium">
                                    {item.productName}
                                  </div>
                                  <div className="col-span-3">
                                    {item.quantity}
                                  </div>
                                  <div className="col-span-3 text-right">
                                    {formatCurrency(item.totalPrice)}
                                  </div>
                                </div>
                              ))}

                              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold bg-blue-50 dark:bg-blue-950/30 border-t border-gray-200 dark:border-gray-800">
                                <div className="col-span-9 text-right">Total</div>
                                <div className="col-span-3 text-right">
                                  {formatCurrency(total)}
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
          )}
        </motion.div>
      )}
    </div>
  );
}
