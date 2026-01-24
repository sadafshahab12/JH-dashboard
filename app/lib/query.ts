import { groq } from "next-sanity";

export const dashboardOrdersQuery = groq`
{
  "totalOrders": count(*[_type == "order"]),

  "statusCounts": {
    "pending": count(*[_type=="order" && status=="pending"]),
    "paid": count(*[_type=="order" && status=="paid"]),
    "processing": count(*[_type=="order" && status=="processing"]),
    "shipped": count(*[_type=="order" && status=="shipped"]),
    "completed": count(*[_type=="order" && status=="completed"]),
    "cancelled": count(*[_type=="order" && status=="cancelled"])
  },

  "statusQuantities": {
    "pending": sum(*[_type=="order" && status=="pending"].items[].quantity),
    "paid": sum(*[_type=="order" && status=="paid"].items[].quantity),
    "processing": sum(*[_type=="order" && status=="processing"].items[].quantity),
    "shipped": sum(*[_type=="order" && status=="shipped"].items[].quantity),
    "completed": sum(*[_type=="order" && status=="completed"].items[].quantity),
    "cancelled": sum(*[_type=="order" && status=="cancelled"].items[].quantity)
  },

  "recentOrders": *[_type=="order"]
    | order(_createdAt desc)[0..9]{
      _id,
      orderNumber,
      status,
      total,
      _createdAt,
      customer {
        fullName,
        country
      },
      "itemsCount": sum(items[].quantity)
    }
}
`;
