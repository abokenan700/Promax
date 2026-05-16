export const FREE_SHIPPING_THRESHOLD = 500;
export const FLAT_SHIPPING_COST = 25;

export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
}
