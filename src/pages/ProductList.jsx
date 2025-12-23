import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { motion } from "framer-motion";
import { CATEGORIES } from "../constants/categories";
import { useCart } from "../context/CartContext";

const PLACEHOLDER = "https://via.placeholder.com/600x600.png?text=No+Image";

export default function ProductList() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [imgMap, setImgMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const createdUrls = []; 

    const fetchImageById = async (id) => {
      try {
        const res = await api.get(`/product/${id}/image`, {
          responseType: "blob",
        });

        const url = URL.createObjectURL(res.data);
        createdUrls.push(url);

        if (mounted) {
          setImgMap((prev) => ({ ...prev, [id]: url }));
        }
      } catch (error) {
        // 404 image -> ignore
        console.warn("No image for this product:", id, error);
      }
    };
    const load = async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await api.get("/products"); 
        if (!mounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setProducts(list);
        await Promise.allSettled(list.map((p) => fetchImageById(p.id)));
      } catch (e) {
        if (mounted) setErr("Failed to load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const categories = useMemo(() => ["all", ...CATEGORIES], []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => (p.title || "").toLowerCase().includes(q));

    if (category !== "all") {
      list = list.filter(
        (p) =>
          String(p.category || "").toLowerCase() ===
          String(category).toLowerCase()
      );
    }

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    if (min !== null && !Number.isNaN(min))
      list = list.filter((p) => Number(p.price) >= min);

    if (max !== null && !Number.isNaN(max))
      list = list.filter((p) => Number(p.price) <= max);

    switch (sortBy) {
      case "priceLow":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "priceHigh":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "nameAZ":
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "nameZA":
        list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      default:
        break;
    }

    return list;
  }, [products, search, category, minPrice, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
  };

  const FiltersPanel = ({ isMobile = false }) => (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 ${
        isMobile ? "" : "sticky top-24"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="mt-4">
        <label className="text-xs text-gray-600 dark:text-gray-300">Search</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs text-gray-600 dark:text-gray-300">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Select category" : c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="text-xs text-gray-600 dark:text-gray-300">Price Range</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            type="number"
            placeholder="Min"
            className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            placeholder="Max"
            className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs text-gray-600 dark:text-gray-300">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
        >
          <option value="default">Default</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
          <option value="nameAZ">Name: A → Z</option>
          <option value="nameZA">Name: Z → A</option>
        </select>
      </div>

      {isMobile && (
        <button
          onClick={() => setMobileFiltersOpen(false)}
          className="mt-4 w-full rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
        >
          Apply
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold">{filteredProducts.length}</span> items
          </span>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="sm:hidden rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Filters
          </button>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-3 right-3 top-20">
            <FiltersPanel isMobile />
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 animate-pulse"
            >
              <div className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="mt-4 h-4 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-2 h-3 w-2/5 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-4 h-5 w-1/4 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      )}

      {err && (
        <div className="mt-8 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-red-700 dark:text-red-200">
          {err}
        </div>
      )}

      {!loading && !err && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-3">
            <FiltersPanel />
          </aside>

          <section className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h3 className="font-semibold">No products found</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Try changing filters or clearing them.
                </p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
                }}
              >
                {filteredProducts.map((p) => {
                  const imgSrc = imgMap[p.id] || p.image || PLACEHOLDER;

                  return (
                    <motion.div
                      key={p.id}
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        show: { opacity: 1, y: 0 },
                      }}
                      className="relative"
                    >
                      <Link
                        to={`/products/${p.id}`}
                        className="group block rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                          <img
                            src={imgSrc}
                            alt={p.title}
                            className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                          <div className="absolute left-3 top-3 rounded-full bg-black/80 text-white text-xs px-3 py-1">
                            {p.category}
                          </div>
                        </div>

                        <h3 className="mt-4 font-semibold leading-snug line-clamp-2">
                          {p.title}
                        </h3>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-lg font-bold">₹{p.price}</p>
                          <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:underline">
                            View →
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={() => addToCart(p)}
                        className="mt-3 w-full rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
                      >
                        Add to Cart
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
