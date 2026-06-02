export type OrderStatus = 'pending' | 'completed' | 'shipped' | 'processing' | 'requires_action' | 'canceled';

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string;
  unit_price?: number;
  variant_title?: string;
}

export interface Order {
  id: string;
  display_id: number | string;
  created_at: string;
  status: OrderStatus | string;
  total: number;
  currency_code: string;
  items: OrderItem[];
}
