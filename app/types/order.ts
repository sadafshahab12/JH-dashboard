export type OrderSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  customization?: string;
}

/* ---------- ORDER ITEM ---------- */

export type CurrencyMode = "pk" | "intl";

export interface PopulatedOrderItem {
  product: {
    _id: string;
    name: string;
    slug: { current: string };
    price: number;
  };
  variantId: string;
  size: OrderSize;
  color: string;
  colorCode: string;
  quantity: number;
  price: number;
  priceMode: CurrencyMode;
}
export type ProductType = "all" | "apparel" | "stationery";
//real data type
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";
export interface OrderProduct {
  _id: string;
  name: string;
  slug: { current: string };
  baseImage?: { asset: { url: string } };
}
export interface OrderItem {
  product: OrderProduct;
  variantId: string;
  size: OrderSize;
  color: string;
  colorCode: string;
  quantity: number;
  price: number;
  priceMode: CurrencyMode;
  productType: "apparel" | "stationery";
}
export interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  currencyMode: CurrencyMode;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  _createdAt: string;
  payment?: {
    receipt?: {
      asset?: {
        url?: string;
      };
    };
  };
}
