import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import CheckoutModal from "./CheckoutModal";
import { api } from "../api/axios";

const PLACEHOLDER = "https://via.placeholder.com/120x120.png?text=No+Image";

export default function CartDrawer({ open, onClose }) {
  const { items, totalAmount, totalItems, removeFromCart, updateQty, clearCart } =
    useCart();

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // ✅ store blob urls per product id
  const [cartImgMap, setCartImgMap] = useState({});

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // ✅ fetch images for cart items whenever items change
  useEffect(() => {
    let mounted = true;
    const createdUrls = [];

    const fetchImageById = async (id) => {
      try {
        const res = await api.get(`/product/${id}/image`, { responseType: "blob" });
        const url = URL.createObjectURL(res.data);
        createdUrls.push(url);

        if (mounted) {
          setCartImgMap((prev) => ({ ...prev, [id]: url }));
        }
      } catch (e) {
        // 404 -> ignore
      }
    };

    // only fetch for ids that we don't already have
    const ids = [...new Set(items.map((i) => i.id))];
    ids.forEach((id) => {
      if (!cartImgMap[id]) fetchImageById(id);
    });

    return () => {
      mounted = false;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // NOTE: cartImgMap intentionally NOT in deps to avoid loops
  }, [items]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            <motion.aside
              className="
                fixed right-0 top-0 z-50
                h-[100dvh] w-[92%] max-w-md
                bg-white dark:bg-gray-950
                border-l border-gray-200 dark:border-gray-800
                shadow-2xl
                flex flex-col
              "
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="text-lg font-semibold">Your Cart</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {totalItems} item(s)
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-md px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {items.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
                    <p className="font-medium">Cart is empty</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Add products to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const imgSrc =
                        cartImgMap[item.id] || item.image || PLACEHOLDER;

                      const title = item.title || item.name || "Product";

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
                        >
                          <div className="h-16 w-16 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                            <img
                              src={imgSrc}
                              alt={title}
                              className="h-full w-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER;
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-semibold line-clamp-2">
                              {title}
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              ₹{Number(item.price).toFixed(2)}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => updateQty(item.id, item.qty - 1)}
                                className="h-8 w-8 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                −
                              </button>

                              <span className="min-w-8 text-center text-sm">
                                {item.qty}
                              </span>

                              <button
                                onClick={() => updateQty(item.id, item.qty + 1)}
                                className="h-8 w-8 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                +
                              </button>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="ml-auto text-xs text-red-600 dark:text-red-400 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Total
                  </span>
                  <span className="text-lg font-bold">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={clearCart}
                    disabled={items.length === 0}
                    className="w-1/2 rounded-md border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => setCheckoutOpen(true)}
                    disabled={items.length === 0}
                    className="w-1/2 rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}