// src/components/EditProductModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/axios";
import { CATEGORIES } from "../constants/categories";

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const modalAnim = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const toFileFromBlob = (blob, fileName = "product-image.jpg") =>
  new File([blob], fileName, { type: blob.type || "image/jpeg" });

export default function EditProductModal({
  open,
  productId,
  onClose,
  onUpdated, 
}) {
  const categories = useMemo(() => CATEGORIES, []);

  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
    imageName: "",
  });

  const [image, setImage] = useState(null); 
  const [imageChanged, setImageChanged] = useState(false);
  const [preview, setPreview] = useState("");

  const previewUrlRef = useRef(null);
  const cleanupPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const setPreviewFromFile = (file) => {
    cleanupPreview();
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreview(url);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !productId) return;

    let mounted = true;

    const fetchAll = async () => {
      try {
        setErr("");
        setLoadingPrefill(true);

        const res = await api.get(`/api/product/${productId}`);
        if (!mounted) return;

        const p = res.data || {};
        setForm({
          id: p.id ?? productId,
          name: p.name ?? "",
          brand: p.brand ?? "",
          description: p.description ?? "",
          price: p.price ?? "",
          category: p.category ?? "",
          stockQuantity: p.stockQuantity ?? "",
          releaseDate: p.releaseDate ?? "",
          productAvailable: Boolean(p.productAvailable),
          imageName: p.imageName ?? "",
        });

        setImage(null);
        setImageChanged(false);
        cleanupPreview();
        setPreview("");

        try {
          const imgRes = await api.get(`/api/product/${productId}/image`, {
            responseType: "blob",
          });

          if (!mounted) return;

          const file = toFileFromBlob(
            imgRes.data,
            p.imageName || "product-image.jpg"
          );
          setImage(file);
          setPreviewFromFile(file);
        } catch (imgErr) {
          console.warn("No image for this product or error loading image", imgErr);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Failed to load product for update.");
      } finally {
        if (mounted) setLoadingPrefill(false);
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
  }, [open, productId]);

  useEffect(() => () => cleanupPreview(), []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setImage(f);
    setImageChanged(true);
    setPreviewFromFile(f);
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.brand.trim()) return "Brand is required";
    if (!form.category) return "Category is required";
    if (!form.price || Number(form.price) <= 0) return "Price must be > 0";
    if (form.stockQuantity === "" || Number(form.stockQuantity) < 0)
      return "Stock must be 0 or more";
    if (!form.releaseDate) return "Release date is required";
    return "";
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const fd = new FormData();

      if (imageChanged && image) fd.append("imageFile", image);
      else fd.append("imageFile", null);

      fd.append(
        "product",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );

      await api.put(`/api/product/${productId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await onUpdated?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      setErr("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={overlay}
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        <motion.div
          variants={modalAnim}
          className="
            relative w-full max-w-3xl
            rounded-2xl border border-gray-200 dark:border-gray-800
            bg-white dark:bg-gray-900
            shadow-2xl overflow-hidden
          "
        >
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Edit Product</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Update details and save
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-5 py-5 bg-gray-50 dark:bg-gray-950">
            {loadingPrefill && (
              <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-sm">
                Loading product...
              </div>
            )}

            {err && (
              <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-200">
                {err}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" required>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  placeholder="Product name"
                />
              </Field>

              <Field label="Brand" required>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={onChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  placeholder="Brand"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                    placeholder="Description"
                  />
                </Field>
              </div>

              <Field label="Category" required>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Price" required>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={onChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  placeholder="Price"
                />
              </Field>

              <Field label="Stock Quantity" required>
                <input
                  name="stockQuantity"
                  type="number"
                  value={form.stockQuantity}
                  onChange={onChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  placeholder="Stock"
                />
              </Field>

              <Field label="Release Date" required>
                <input
                  name="releaseDate"
                  type="date"
                  value={form.releaseDate ? String(form.releaseDate).slice(0, 10) : ""}
                  onChange={onChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Image">
                  {preview && (
                    <div className="mb-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                      <img
                        src={preview}
                        alt="preview"
                        className="h-40 w-full object-contain"
                      />
                      {!imageChanged && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Keeping existing image (choose a new file to replace)
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={onPickFile}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  />
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to keep current image
                  </div>
                </Field>
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    name="productAvailable"
                    checked={form.productAvailable}
                    onChange={onChange}
                    className="h-4 w-4"
                  />
                  Product Available
                </label>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              disabled={saving || loadingPrefill}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
