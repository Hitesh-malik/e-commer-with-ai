import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function CheckoutModal({ open, onClose }) {
  const { items, totalAmount, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
    }
  }, [open]);

  const totalText = useMemo(() => `₹${totalAmount.toFixed(2)}`, [totalAmount]);

  const confirm = () => {
    if (!items.length) return;
    if (!name.trim()) return alert("Please enter your name");
    if (!email.trim()) return alert("Please enter your email");

    alert(`Purchase confirmed!\nName: ${name}\nEmail: ${email}\nTotal: ${totalText}`);
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold">Checkout</h3>
                <button
                  onClick={onClose}
                  className="rounded-md px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="px-5 py-4">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                    <p className="font-medium">Cart is empty</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Add items to checkout.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.slice(0, 3).map((it) => (
                      <div key={it.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800">
                          {it.image ? (
                            <img src={it.image} alt={it.title} className="h-full w-full object-contain p-2" />
                          ) : (
                            <span className="text-[10px] text-gray-500">No Image</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold line-clamp-1">{it.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Quantity: {it.qty}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Price: ₹{Number(it.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {items.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        + {items.length - 3} more item(s) in cart
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-center">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-2 text-sm font-semibold">
                        Total: {totalText}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={onClose}
                  className="rounded-md px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                >
                  Close
                </button>
                <button
                  onClick={confirm}
                  disabled={!items.length}
                  className="rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
