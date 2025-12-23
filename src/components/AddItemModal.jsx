import { useEffect, useState } from "react";

export default function AddItemModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });

  // Close on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        price: "",
        category: "",
        image: "",
        description: "",
      });
    }
  }, [open]);

  if (!open) return null;

  const update = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // basic validation
    if (!form.title.trim()) return alert("Title is required");
    if (!form.price || Number.isNaN(Number(form.price)))
      return alert("Valid price is required");

    onSubmit({
      ...form,
      price: Number(form.price),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-xl rounded-2xl border border-gray-800 bg-gray-950 text-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">Add New Item</h3>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="text-sm text-gray-300">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={update}
              className="mt-1 w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
              placeholder="e.g. Wireless Headphones"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Price</label>
              <input
                name="price"
                value={form.price}
                onChange={update}
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
                placeholder="e.g. 49.99"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={update}
                className="mt-1 w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
                placeholder="e.g. electronics"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Image URL</label>
            <input
              name="image"
              value={form.image}
              onChange={update}
              className="mt-1 w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows={4}
              className="mt-1 w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
              placeholder="Write product details..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
