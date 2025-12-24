import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/axios";
import { CATEGORIES } from "../constants/categories";

export default function AddItemModal({ open, onClose, onCreated }) {
  const baseUrl = import.meta.env.VITE_BASE_URL ?? "http://localhost:8080";

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);

  const [imageFile, setImageFile] = useState(null);  
  const [aiImage, setAiImage] = useState(null);  
  const [previewUrl, setPreviewUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingProduct, setGeneratingProduct] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (aiImage?.url) URL.revokeObjectURL(aiImage.url);
    };
  }, [aiImage]);

  const canGenerateDescription = Boolean(product.name.trim() && product.category);
  const canGenerateImage = Boolean(
    product.name.trim() && product.category && product.description.trim()
  );

  const setField = (name, value) => {
    setProduct((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const validateForm = () => {
    const e = {};

    if (!product.name.trim()) e.name = "Product name is required";
    if (!product.brand.trim()) e.brand = "Brand is required";

    if (!product.price) e.price = "Price is required";
    else if (Number(product.price) <= 0) e.price = "Price must be greater than zero";

    if (!product.category) e.category = "Please select a category";

    if (product.stockQuantity === "") e.stockQuantity = "Stock quantity is required";
    else if (Number(product.stockQuantity) < 0) e.stockQuantity = "Stock quantity cannot be negative";

    if (!product.releaseDate) e.releaseDate = "Release date is required";

    if (imageFile) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(imageFile.type)) {
        e.image = "Please select a valid image file (JPEG or PNG)";
      } else if (imageFile.size > 5 * 1024 * 1024) {
        e.image = "Image size should be less than 5MB";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onImagePick = (file) => {
    setValidated(false);
    setErrors((e) => ({ ...e, image: null }));

    setImageFile(file || null);

    if (aiImage?.url) URL.revokeObjectURL(aiImage.url);
    setAiImage(null);

    if (!file) {
      setPreviewUrl("");
      return;
    }

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors((e) => ({ ...e, image: "Please select a valid image file (JPEG or PNG)" }));
    } else if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "Image size should be less than 5MB" }));
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const generateDescription = async () => {
    if (!canGenerateDescription) return;
    setGeneratingDescription(true);
    try {
      const res = await api.post(
        `${baseUrl}/api/product/generate-description`,
        null,
        { params: { name: product.name, category: product.category } }
      );

      const text = typeof res.data === "string" ? res.data : String(res.data);
      setProduct((p) => ({ ...p, description: text }));
    } catch (err) {
      console.error(err);
      setErrors((e) => ({ ...e, _top: "Failed to generate description." }));
    } finally {
      setGeneratingDescription(false);
    }
  };
 
  const generateImage = async () => {
    if (!canGenerateImage) return;
    setGeneratingImage(true);
    try {
      const res = await api.post(
        `${baseUrl}/api/product/generate-image`,
        null,
        {
          params: {
            name: product.name,
            category: product.category,
            description: product.description,
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);

      if (previewUrl && imageFile) URL.revokeObjectURL(previewUrl);

      setImageFile(null);
      setAiImage({ blob, url });
      setPreviewUrl(url);
      setErrors((e) => ({ ...e, image: null }));
    } catch (err) {
      console.error(err);
      setErrors((e) => ({ ...e, _top: "Failed to generate image." }));
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateProductFromPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingProduct(true);
    try {
      const res = await api.post(
        `${baseUrl}/api/product/generate-product?query=${encodeURIComponent(aiPrompt)}`
      );

      const p = res.data || {};
      setProduct({
        name: p.name || "",
        brand: p.brand || "",
        description: p.description || "",
        price: p.price || "",
        category: p.category || "",
        stockQuantity: p.stockQuantity || "",
        releaseDate: p.releaseDate || "",
        productAvailable: Boolean(p.productAvailable),
      });

      setAiPrompt("");
      setErrors({});
      setValidated(false);
    } catch (err) {
      console.error(err);
      setErrors((e) => ({ ...e, _top: "Failed to generate product." }));
    } finally {
      setGeneratingProduct(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    const ok = validateForm();
    if (!ok) return;

    try {
      setSubmitting(true);
      setErrors((er) => ({ ...er, _top: "" }));

      const formData = new FormData();

      if (imageFile) {
        formData.append("imageFile", imageFile);
      } else if (aiImage?.blob) {
        const file = new File([aiImage.blob], "ai-generated-image.jpg", {
          type: "image/jpeg",
        });
        formData.append("imageFile", file);
      }

      formData.append(
        "product",
        new Blob([JSON.stringify(product)], { type: "application/json" })
      );

      await api.post(`${baseUrl}/api/product`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProduct({
        name: "",
        brand: "",
        description: "",
        price: "",
        category: "",
        stockQuantity: "",
        releaseDate: "",
        productAvailable: false,
      });

      setErrors({});
      setValidated(false);
      setSubmitting(false);

      if (aiImage?.url) URL.revokeObjectURL(aiImage.url);
      if (previewUrl && imageFile) URL.revokeObjectURL(previewUrl);

      setImageFile(null);
      setAiImage(null);
      setPreviewUrl("");

      onCreated?.();  
      onClose?.();    
    } catch (err) {
      console.error(err);
      setErrors((e) => ({
        ...e,
        _top: "Error adding product. Please try again.",
      }));
      setSubmitting(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none " +
    "border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600";

  const labelBase = "text-xs font-medium text-gray-700 dark:text-gray-200";

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="
            relative w-full max-w-4xl
            rounded-2xl border border-gray-200 dark:border-gray-800
            bg-white dark:bg-gray-900
            shadow-xl overflow-hidden
          "
          style={{ height: "min(92dvh, 760px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Add New Product</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Create manually or use AI to speed up description & image.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-64px)] overflow-y-auto">
            <form onSubmit={onSubmit} className="p-4 sm:p-6">
              {errors._top && (
                <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-200">
                  {errors._top}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Name *</label>
                      <input
                        className={`${inputBase} ${validated && errors.name ? "border-red-300 dark:border-red-800" : ""}`}
                        value={product.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Product name"
                      />
                      {validated && errors.name && (
                        <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelBase}>Brand *</label>
                      <input
                        className={`${inputBase} ${validated && errors.brand ? "border-red-300 dark:border-red-800" : ""}`}
                        value={product.brand}
                        onChange={(e) => setField("brand", e.target.value)}
                        placeholder="Brand"
                      />
                      {validated && errors.brand && (
                        <p className="mt-1 text-xs text-red-600">{errors.brand}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelBase}>Category *</label>
                      <select
                        className={`${inputBase} ${validated && errors.category ? "border-red-300 dark:border-red-800" : ""}`}
                        value={product.category}
                        onChange={(e) => setField("category", e.target.value)}
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {validated && errors.category && (
                        <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelBase}>Price (₹) *</label>
                      <input
                        type="number"
                        className={`${inputBase} ${validated && errors.price ? "border-red-300 dark:border-red-800" : ""}`}
                        value={product.price}
                        onChange={(e) => setField("price", e.target.value)}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                      />
                      {validated && errors.price && (
                        <p className="mt-1 text-xs text-red-600">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelBase}>Stock Qty *</label>
                      <input
                        type="number"
                        className={`${inputBase} ${validated && errors.stockQuantity ? "border-red-300 dark:border-red-800" : ""}`}
                        value={product.stockQuantity}
                        onChange={(e) => setField("stockQuantity", e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                      {validated && errors.stockQuantity && (
                        <p className="mt-1 text-xs text-red-600">{errors.stockQuantity}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Release Date *</label>
                      <input
                        type="date"
                        className={`${inputBase} ${validated && errors.releaseDate ? "border-red-300 dark:border-red-800" : ""}`}
                        value={product.releaseDate}
                        onChange={(e) => setField("releaseDate", e.target.value)}
                      />
                      {validated && errors.releaseDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.releaseDate}</p>
                      )}
                    </div>

                    <div className="flex items-end gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={product.productAvailable}
                          onChange={(e) => setField("productAvailable", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                        />
                        Product Available
                      </label>
                    </div>
                  </div>

                 
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label className={labelBase}>
                        Description
                      </label>

                      <button
                        type="button"
                        onClick={generateDescription}
                        disabled={!canGenerateDescription || generatingDescription}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition
                          ${
                            !canGenerateDescription || generatingDescription
                              ? "opacity-60 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                              : "border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-950/60"
                          }`}
                        title={
                          !canGenerateDescription
                            ? "Enter name + select category first"
                            : "Generate description with AI"
                        }
                      >
                        {generatingDescription ? "Generating..." : "🤖 Generate Description"}
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      className={inputBase}
                      value={product.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Write description or generate using AI..."
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Product Image</div>

                      <button
                        type="button"
                        onClick={generateImage}
                        disabled={!canGenerateImage || generatingImage}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition
                          ${
                            !canGenerateImage || generatingImage
                              ? "opacity-60 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                              : "border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-950/60"
                          }`}
                        title={
                          !canGenerateImage
                            ? "Enter name + category + description first"
                            : "Generate image with AI"
                        }
                      >
                        {generatingImage ? "Generating..." : "🖼️ Generate Image"}
                      </button>
                    </div>

                    <div className="mt-3">
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        className={`${inputBase} ${validated && errors.image ? "border-red-300 dark:border-red-800" : ""}`}
                        onChange={(e) => onImagePick(e.target.files?.[0])}
                      />
                      {validated && errors.image && (
                        <p className="mt-1 text-xs text-red-600">{errors.image}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Upload (JPG/PNG) or generate with AI.
                      </p>
                    </div>

                    {previewUrl ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {aiImage ? "AI image preview" : "Selected image preview"}
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              if (aiImage?.url) URL.revokeObjectURL(aiImage.url);
                              if (previewUrl && imageFile) URL.revokeObjectURL(previewUrl);
                              setAiImage(null);
                              setImageFile(null);
                              setPreviewUrl("");
                            }}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2">
                          <img
                            src={previewUrl}
                            alt="preview"
                            className="w-full h-48 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No image selected
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition disabled:opacity-60"
                    >
                      {submitting ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
