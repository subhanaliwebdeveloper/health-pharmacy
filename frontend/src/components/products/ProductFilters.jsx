import React from "react";

export default function ProductFilters({ categories, category, onCategory }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-5 lg:h-fit">
      <h3 className="mb-4 text-lg font-bold text-slate-800">Categories</h3>

      <div className="space-y-2">
        <button
          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition ${!category ? 'border-brand-200 bg-emerald-50 text-brand-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
          onClick={() => onCategory('')}
        >
          <span>All Medicines</span>
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition ${String(category) === String(c.id) ? 'border-brand-200 bg-emerald-50 text-brand-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
            onClick={() => onCategory(c.id)}
          >
            <span>{c.name}</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">{c.product_count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
