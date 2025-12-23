import { useEffect, useState } from "react";
import { CATEGORIES } from "../constants/categories";

export default function AddItemModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    stockQty: "",
    releaseDate: "",
    available: true,
    imageFile: null,
  });

  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [aiImgLoading, setAiImgLoading] = useState(false);

  // ✅ prevent background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // ✅ ESC close
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // reset on open
  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        stockQty: "",
        releaseDate: "",
        available: true,
        imageFile: null,
      });
      setAiDescLoading(false);
      setAiImgLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const updateFile = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((p) => ({ ...p, imageFile: file }));
  };

  const canGenerateDesc = form.name.trim() && form.category.trim();
  const canGenerateImage =
    form.name.trim() && form.category.trim() && form.description.trim();

  const handleGenerateDescription = () => {
    if (!canGenerateDesc) return;
    setAiDescLoading(true);
    setTimeout(() => {
      setForm((p) => ({
        ...p,
        description: `AI-generated description: ${p.name} (${p.category}). Premium design, modern build, and great value for daily use.`,
      }));
      setAiDescLoading(false);
    }, 800);
  };

  const handleGenerateImage = () => {
    if (!canGenerateImage) return;
    setAiImgLoading(true);
    setTimeout(() => {
      alert("AI image generation will be connected to backend later.");
      setAiImgLoading(false);
    }, 700);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("Product name is required");
    if (!form.brand.trim()) return alert("Brand is required");
    if (!form.category.trim()) return alert("Category is required");
    if (form.price === "" || Number.isNaN(Number(form.price)))
      return alert("Valid price is required");
    if (form.stockQty === "" || Number.isNaN(Number(form.stockQty)))
      return alert("Valid stock quantity is required");
    if (!form.releaseDate) return alert("Release date is required");

    const payload = {
      id: crypto?.randomUUID?.() ?? Date.now(),
      title: form.name.trim(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      stockQty: Number(form.stockQty),
      releaseDate: form.releaseDate,
      available: form.available,
      image: "",
      imageFile: form.imageFile,
    };

    onSubmit?.(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* ✅ Modal: full height on mobile with internal scroll */}
      <div
        className="
          relative w-full max-w-4xl
          max-h-[92dvh] sm:max-h-[88dvh]
          rounded-2xl border border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
          shadow-2xl
          flex flex-col
          overflow-hidden
        "
      >
        {/* ✅ Sticky header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold">Add New Product</h3>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {/* ✅ Scroll content area */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Product Name"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Brand</label>
              <input
                name="brand"
                value={form.brand}
                onChange={update}
                placeholder="Enter your Brand"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={update}
              className="mt-1 w-full md:w-1/2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="text-sm font-medium">
                Description <span className="text-xs text-gray-500">(Optional)</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!canGenerateDesc || aiDescLoading}
                className={`rounded-md px-3 py-2 text-xs font-medium border transition
                ${
                  !canGenerateDesc || aiDescLoading
                    ? "cursor-not-allowed border-gray-200 dark:border-gray-800 text-gray-400"
                    : "border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                }`}
              >
                {aiDescLoading ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows={4}
              placeholder="Add product description (optional) or use AI to generate one"
              className="mt-2 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
            />

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Fill in product name and category to enable AI description generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Price</label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-200">
                  ₹
                </span>
                <input
                  name="price"
                  value={form.price}
                  onChange={update}
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  className="w-full rounded-r-md border border-l-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Stock Quantity</label>
              <input
                name="stockQty"
                value={form.stockQty}
                onChange={update}
                type="number"
                placeholder="Stock Remaining"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Release Date</label>
              <input
                name="releaseDate"
                value={form.releaseDate}
                onChange={update}
                type="date"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="text-sm font-medium">
                Image <span className="text-xs text-gray-500">(Optional)</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={!canGenerateImage || aiImgLoading}
                className={`rounded-md px-3 py-2 text-xs font-medium border transition
                ${
                  !canGenerateImage || aiImgLoading
                    ? "cursor-not-allowed border-gray-200 dark:border-gray-800 text-gray-400"
                    : "border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/40"
                }`}
              >
                {aiImgLoading ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={updateFile}
              className="mt-2 block w-full text-sm text-gray-600 dark:text-gray-300
                file:mr-4 file:rounded-md file:border-0
                file:bg-gray-100 file:text-gray-800
                dark:file:bg-gray-800 dark:file:text-gray-100
                file:px-4 file:py-2 file:text-sm file:font-medium
                hover:file:bg-gray-200 dark:hover:file:bg-gray-700"
            />

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Upload a product image (JPG, PNG) or generate one with AI.
              <br />
              Fill in name, category, and description to enable AI image generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="available"
              name="available"
              checked={form.available}
              onChange={update}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
            />
            <label htmlFor="available" className="text-sm">
              Product Available
            </label>
          </div>

          {/* ✅ Sticky footer buttons */}
          <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 py-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md px-5 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}