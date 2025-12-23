import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/axios";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function ProductView() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setErr("");
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (mounted) setProduct(res.data);
      } catch {
        if (mounted) setErr("Failed to load product.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Product Details</h2>
        <Link to="/products" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Products
        </Link>
      </div>

      {loading && (
        <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800" />
            <div>
              <div className="h-6 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-3 h-4 w-2/5 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-6 h-10 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-6 h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      )}

      {err && (
        <div className="mt-8 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-red-700 dark:text-red-200">
          {err}
        </div>
      )}

      {!loading && !err && product && (
        <motion.div
          className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <img src={product.image} alt={product.title} className="h-full w-full object-contain p-6" />
            </motion.div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-1 text-xs text-gray-700 dark:text-gray-200">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {product.category}
              </div>

              <h3 className="mt-4 text-xl font-semibold leading-snug">{product.title}</h3>

              <div className="mt-4 flex items-end justify-between gap-3">
                <p className="text-3xl font-bold">₹{product.price}</p>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Product ID: <span className="font-mono">{product.id}</span>
                </span>
              </div>

              <p className="mt-5 text-gray-700 dark:text-gray-200 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => addToCart(product)}
                  className="rounded-md bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => addToCart(product)}
                  className="rounded-md border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
