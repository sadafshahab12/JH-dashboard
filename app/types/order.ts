/* ---------- SANITY HELPERS ---------- */

export interface SanityReference {
  _type: "reference";
  _ref: string;
}

export interface SanityFileReference {
  _type: "file";
  asset: SanityReference;
}

export interface SanityImageReference {
  _type: "image";
  asset: SanityReference;
}

/* ---------- ORDER STATUS ---------- */

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

/* ---------- CUSTOMER ---------- */

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

export type OrderSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type CurrencyMode = "pk" | "intl";

export interface OrderItem {
  _key: string;
  product: SanityReference;
  variantId: string;
  size: OrderSize;
  color: string;
  colorCode: string;
  quantity: number;
  price: number;
  priceMode: CurrencyMode;
}

/* ---------- PAYMENT ---------- */

export interface OrderPayment {
  method: "EasyPaisa";
  receipt?: SanityFileReference;
}

/* ---------- STORED ORDER (SANITY) ---------- */

export interface Order {
  _id?: string;
  _createdAt?: string;
  _type: "order";

  orderNumber: string;
  customer: OrderCustomer;
  currencyMode: CurrencyMode;
  items: OrderItem[];
  payment: OrderPayment;

  subtotal: number;
  shippingFee: number;
  total: number;

  status: OrderStatus;
}

/* ---------- CREATE ORDER PAYLOAD ---------- */

export interface CreateOrderPayload {
  _type: "order";

  orderNumber?: string;

  customer: OrderCustomer;
  currencyMode: CurrencyMode;

  items: {
    _key: string;
    product: SanityReference;
    variantId: string;
    size: OrderSize;
    color: string;
    colorCode: string;
    quantity: number;
    price: number;
    priceMode: CurrencyMode;
  }[];

  subtotal: number;
  shippingFee: number;
  total: number;

  payment: {
    method: "EasyPaisa";
    // Use this only if you upload receipt separately
    receiptAssetId?: string;
  };
}

/* ---------- POPULATED ORDER TYPES ---------- */

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

export interface PopulatedOrder {
  _id?: string;
  _type: "order";
  orderNumber: string;
  customer: OrderCustomer;
  currencyMode: CurrencyMode;
  items: PopulatedOrderItem[];
  payment: OrderPayment;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
}
//real data type