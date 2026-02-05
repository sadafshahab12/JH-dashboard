import { groq } from "next-sanity";

export const ORDERS_QUERY = groq`
*[_type == 'order'] | order(_createdAt desc){
  _id,
  orderNumber,
  _createdAt,
  status,
  subtotal,
  shippingFee,
  total,
  currencyMode,
  customer,
  payment{
    method, // Method bhi add kar diya taake dashboard pe nazar aaye
    receipt{
      asset->{url}
    }
  },
  items[] {
    variantId,
    size,
    color,
    colorCode,
    quantity,
    price,
    priceMode,
    productType,
    pageType, 
    product->{
      _id,
      name,
      slug,
      baseImage{asset->{url}}
    }
  }
}`;
