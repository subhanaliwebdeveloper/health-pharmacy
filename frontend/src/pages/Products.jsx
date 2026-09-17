import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories } from "../services/productService";
import { useProducts } from "../hooks/useProducts";
import ProductFilters from "../components/products/ProductFilters";
import ProductGrid from "../components/products/ProductGrid";
import ProductSearch from "../components/products/ProductSearch";

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState([]);
  const search = sp.get("search") || "";
  const category = sp.get("category") || "";
  const sort = sp.get("sort") || "newest";
  const [q, setQ] = useState(search);

  useEffect(() => {
    getCategories().then(setCats).catch(() => setCats([]));
  }, []);

  useEffect(() => {
    setQ(search);
  }, [search]);

  const query = `?search=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&limit=50`;
  const { data, loading } = useProducts(query);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    setSp(next);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 lg:px-6">
      <div className="mb-6 text-center lg:text-left">
        <span className="mb-2 inline-block text-[11px] font-extrabold tracking-[0.2em] text-brand-600">
          SHOP ONLINE
        </span>
        <h1 className="text-3xl font-black text-slate-800 sm:text-4xl">All Medicines</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Browse genuine medicines and healthcare essentials.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ProductFilters
          categories={cats}
          category={category}
          onCategory={(value) => updateParam("category", value)}
        />

        <main className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <ProductSearch
                value={q}
                onChange={(value) => {
                  setQ(value);
                  updateParam("search", value);
                }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none ring-0"
            >
              <option value="newest">Newest</option>
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <ProductGrid products={data} loading={loading} />
        </main>
      </div>
    </div>
  );
}
