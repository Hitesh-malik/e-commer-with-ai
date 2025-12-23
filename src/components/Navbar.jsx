import { NavLink } from "react-router-dom";
import { useState } from "react";
import AddItemModal from "./AddItemModal";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition ${isActive
      ? "bg-white text-black dark:bg-gray-200 dark:text-black"
      : "text-gray-200 hover:bg-gray-800 hover:text-white"
    }`;

  const handleSubmit = (data) => {
    // later you can POST using Axios
    console.log("New Item:", data);
  };

  return (
    <>
      <header className="bg-gray-950 text-white border-b border-gray-800">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">


            <NavLink to="/" className="text-lg font-bold tracking-wide">
              E-Commer
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
          </div>


          <div className="flex items-center">
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-medium transition"
            >
              Add Item
            </button>
          </div>
        </nav>
      </header>

      {/* Add Item Modal */}
      <AddItemModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
