import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  const addToCart = (product) => {
    setItems((prev) => {
      const id = product.id;
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title ?? product.name ?? "Untitled",
          price: Number(product.price ?? 0),
          image: product.image ?? "",
          qty: 1,
          category: product.category ?? "",
        },
      ];
    });
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  const updateQty = (id, qty) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty } : x)).filter((x) => x.qty > 0)
    );

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, x) => sum + (x.qty || 0), 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, x) => sum + (x.qty || 0) * (x.price || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalAmount }),
    [items, totalItems, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
