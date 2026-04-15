export type CartItem = {
  productId: string;
  qty: number;
};

const STORAGE_KEY = "trendy_threads_cart_v1";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => {
        const productId = typeof (x as any)?.productId === "string" ? (x as any).productId : "";
        const qtyNum = Number((x as any)?.qty);
        const qty = Number.isFinite(qtyNum) ? Math.max(1, Math.floor(qtyNum)) : 1;
        return productId ? ({ productId, qty } satisfies CartItem) : null;
      })
      .filter(Boolean) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

