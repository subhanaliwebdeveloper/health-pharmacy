import React from "react";
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

export default function ProductGrid({ products, loading }) {
  if (loading) return <Loader />;
  if (!products.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
        No medicines found. Try another search.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
