import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export function useProducts(query = "") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const result = await getProducts(query);

        if (mounted) {
          setData(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    // Automatically check for new products every 5 seconds
    const interval = setInterval(loadProducts, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [query]);

  return { data, loading };
}