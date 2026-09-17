import React from "react";

export default function ProductSearch({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search medicines..."
        className="w-full border-0 bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
      <span className="text-lg text-slate-500">⌕</span>
    </div>
  );
}
