import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import AddItemModal from "./AddItemModal";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const { theme, toggle } = useTheme();
  const { totalItems } = useCart();

  // close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileMenu(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? "bg-white text-black dark:bg-gray-200 dark:text-black"
        : "text-gray-200 hover:bg-gray-800 hover:text-white"
    }`;

  const handleSubmit = (data) => {
    console.log("New Product:", data);
    alert("Product saved in UI only (backend integration can be added next).");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gray-950 text-white border-b border-gray-800">
        <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          {/* LEFT: Logo (mobile) + Add Item (desktop) */}
          <div className="flex items-center gap-3">
            {/* Mobile Logo */}
            <NavLink to="/" className="md:hidden text-lg font-bold tracking-wide">
              E-Commer
            </NavLink>

            {/* Desktop Add Item */}
            <button
              onClick={() => setOpenAdd(true)}
              className="hidden md:inline-flex px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-medium transition"
            >
              Add Item
            </button>
          </div>

          {/* CENTER: Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={linkCls}>
              Home
            </NavLink>
            <NavLink to="/products" className={linkCls}>
              Products
            </NavLink>
          </div>

          {/* RIGHT: Cart + Theme + Logo (desktop) / Menu (mobile) */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={() => setOpenCart(true)}
              className="relative rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 transition"
              title="Open cart"
            >
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 transition"
              title="Toggle theme"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            {/* Desktop Logo */}
            <NavLink to="/" className="hidden md:block text-lg font-bold tracking-wide">
              E-Commer
            </NavLink>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu((v) => !v)}
              className="md:hidden rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 transition"
              aria-label="Open menu"
            >
              {mobileMenu ? "✕" : "☰"}
            </button>
          </div>
        </nav>

        {/* MOBILE DROPDOWN MENU */}
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
              <NavLink
                to="/"
                className={linkCls}
                onClick={() => setMobileMenu(false)}
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                className={linkCls}
                onClick={() => setMobileMenu(false)}
              >
                Products
              </NavLink>

              <button
                onClick={() => {
                  setMobileMenu(false);
                  setOpenAdd(true);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 transition"
              >
                Add Item
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals / Drawer */}
      <AddItemModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleSubmit}
      />
      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
}
