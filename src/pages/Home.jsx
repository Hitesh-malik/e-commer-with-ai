import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative p-8 sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-1 text-xs text-gray-700 dark:text-gray-200">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            AI-Powered Store Demo
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">E-Commer</span>
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
            This project demonstrates a modern e-commerce UI where{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              AI helps generate product descriptions
            </span>{" "}
            and also supports{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              AI-generated product images
            </span>{" "}
            for faster catalog creation.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
            >
              Browse Products →
            </Link>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tip: Click <span className="font-semibold">Add Item</span> in the navbar to open the modal.
            </div>
          </div>
        </div>
      </motion.section>

      {/* Feature cards */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        <FeatureCard
          title="AI Description Generator"
          desc="When adding a product, AI can create a clean, attractive product description from a short prompt."
          badge="Text AI"
        />
        <FeatureCard
          title="AI Image Support"
          desc="AI can generate product images to match the product idea—useful for prototypes and quick catalogs."
          badge="Image AI"
        />
        <FeatureCard
          title="Modern UX + Animations"
          desc="Light/Dark theme support with smooth transitions and Framer Motion animations for a premium feel."
          badge="UI/UX"
        />
      </motion.section>

      {/* How it works */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mt-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold">How AI is used in this project</h2>
        <ul className="mt-4 space-y-3 text-gray-700 dark:text-gray-200">
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <div>
              <span className="font-semibold">AI Description:</span> Product description can be generated automatically to save time and maintain quality.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
            <div>
              <span className="font-semibold">AI Image:</span> Product image can be generated based on product name/category for a consistent visual catalog.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
            <div>
              <span className="font-semibold">Workflow:</span> Add Item → AI generates description & image → Save → Product appears in list.
            </div>
          </li>
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="rounded-md border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            View Product List
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

function FeatureCard({ title, desc, badge }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition">
      <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-700 dark:text-gray-200">
        {badge}
      </div>
      <h3 className="mt-3 font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
