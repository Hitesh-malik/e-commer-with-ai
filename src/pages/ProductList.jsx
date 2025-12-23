// src/pages/ProductList.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { motion } from "framer-motion";
import { CATEGORIES } from "../constants/categories";
import { useCart } from "../context/CartContext";

const PLACEHOLDER = "https://via.placeholder.com/600x600.png?text=No+Image";

export default function ProductList() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [imgMap, setImgMap] = useState({}); // { [id]: objectUrl }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // -------- Normal Filters ----------
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // -------- Smart Search ----------
  const [smartQuery, setSmartQuery] = useState("");
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartError, setSmartError] = useState("");
  const [smartResults, setSmartResults] = useState(null); // null => inactive, [] => active empty

  const categories = useMemo(() => ["all", ...CATEGORIES], []);

  // ------------------ helpers ------------------
  const revokeAllObjectUrls = useCallback(() => {
    setImgMap((prev) => {
      Object.values(prev).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      });
      return {};
    });
  }, []);

  const fetchImageById = useCallback(
    async (id, mountedRef) => {
      try {
        const res = await api.get(`/product/${id}/image`, { responseType: "blob" });
        const url = URL.createObjectURL(res.data);
        if (mountedRef.current) {
          setImgMap((prev) => ({ ...prev, [id]: url }));
        } else {
          URL.revokeObjectURL(url);
        }
      } catch {
        // 404 image -> ignore
      }
    },
    []
  );

  // ✅ Fetch all products (used on mount + on smart clear)
  const fetchAllProducts = useCallback(async () => {
    setErr("");
    setLoading(true);

    // if you want freshest images, revoke old ones before refetch
    revokeAllObjectUrls();

    try {
      const res = await api.get("/products");
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list);

      const mountedRef = { current: true };
      await Promise.allSettled(list.map((p) => fetchImageById(p.id, mountedRef)));
    } catch {
      setErr("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [fetchImageById, revokeAllObjectUrls]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    const mountedRef = { current: true };

    (async () => {
      try {
        setErr("");
        setLoading(true);

        // clear old urls on first mount load
        revokeAllObjectUrls();

        const res = await api.get("/products");
        if (!mounted) return;

        const list = Array.isArray(res.data) ? res.data : [];
        setProducts(list);

        await Promise.allSettled(
          list.map((p) => fetchImageById(p.id, mountedRef))
        );
      } catch {
        if (mounted) setErr("Failed to load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      mountedRef.current = false;
      // cleanup all object URLs on unmount
      revokeAllObjectUrls();
    };
  }, [fetchImageById, revokeAllObjectUrls]);

  // -------- Normal filtered list ----------
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

    if (min !== null && !Number.isNaN(min)) list = list.filter((p) => Number(p.price) >= min);
    if (max !== null && !Number.isNaN(max)) list = list.filter((p) => Number(p.price) <= max);

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

  // ✅ Smart Search API call
  const runSmartSearch = async () => {
    const q = smartQuery.trim();
    if (!q) return;

    setSmartError("");
    setSmartLoading(true);

    try {
      /**
       * ✅ CHANGE this endpoint if needed.
       * Current: GET /api/products/smart-search?query=...
       */
      const res = await api.get(`/api/products/smart-search`, {
        params: { query: q },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      setSmartResults(list);

      // Fetch images for smart results if missing
      const mountedRef = { current: true };
      await Promise.allSettled(
        list.map(async (p) => {
          if (imgMap[p.id]) return;
          await fetchImageById(p.id, mountedRef);
        })
      );
    } catch (e) {
      console.error(e);
      setSmartError("Smart search failed. Please try again.");
      setSmartResults([]);
    } finally {
      setSmartLoading(false);
    }
  };

  // ✅ Clear smart search AND refetch full products again
  const clearSmartSearch = async () => {
    setSmartQuery("");
    setSmartResults(null);
    setSmartError("");
    await fetchAllProducts();
  };

  const listToRender = smartResults !== null ? smartResults : filteredProducts;

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
        <label className="text-xs text-gray-600 dark:text-gray-300">Search (title)</label>
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          {smartResults !== null ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Showing <span className="font-semibold">{listToRender.length}</span> smart results for{" "}
              <span className="font-semibold">"{smartQuery}"</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Showing <span className="font-semibold">{listToRender.length}</span> items
            </p>
          )}
        </div>

        {/* Smart Search */}
        <div className="w-full sm:w-[460px]">
          <label className="text-xs text-gray-600 dark:text-gray-300">Smart Search (AI)</label>
          <div className="mt-1 flex gap-2">
            <input
              value={smartQuery}
              onChange={(e) => setSmartQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSmartSearch();
              }}
              placeholder='Try: "gaming laptop under 80k", "wireless headphones"'
              className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
            />

            <button
              onClick={runSmartSearch}
              disabled={smartLoading || !smartQuery.trim()}
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {smartLoading ? "Searching..." : "Search"}
            </button>

            {smartResults !== null && (
              <button
                onClick={clearSmartSearch}
                className="rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Clear
              </button>
            )}
          </div>

          {smartError && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-300">{smartError}</div>
          )}
        </div>

        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="sm:hidden rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Filters
        </button>
      </div>

      {/* Mobile filters */}
      {mobileFiltersOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-3 right-3 top-20">
            <FiltersPanel isMobile />
          </div>
        </div>
      )}

      {/* States */}
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
            {listToRender.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h3 className="font-semibold">No products found</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Try changing filters OR smart search query.
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
                {listToRender.map((p) => {
                  const imgSrc = imgMap[p.id] || p.image || PLACEHOLDER;

                  return (
                    <motion.div
                      key={p.id}
                      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
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

                        <h3 className="mt-4 font-semibold leading-snug line-clamp-2">{p.title}</h3>

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
