import { useQuery } from "@tanstack/react-query";
import { l1Categories, type L1Category } from "../data/catalog";
import { queryKeys } from "../lib/queryKeys";
import { API_BASE } from "../lib/apiBase";

interface ApiCategory {
  slug: string;
  name: string;
  image_url: string;
}

async function fetchCategories(): Promise<L1Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: ApiCategory[] = await res.json();

  if (!data || data.length === 0) return l1Categories;

  const overrides = new Map(data.map((row) => [row.slug, row.image_url]));
  return l1Categories.map((cat) =>
    overrides.has(cat.id) ? { ...cat, img: overrides.get(cat.id)! } : cat
  );
}

export function useCategories() {
  const { data: categories = l1Categories, isLoading } = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: fetchCategories,
  });
  return { categories, loading: isLoading };
}
