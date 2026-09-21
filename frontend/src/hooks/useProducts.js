import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';

/**
 * Fetches products whenever `query` changes.
 * No polling — data only refreshes on filter/param change.
 */
export function useProducts(query = '') {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getProducts(query)
      .then((result) => { if (!cancelled) setData(result); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [query]);

  return { data, loading };
}