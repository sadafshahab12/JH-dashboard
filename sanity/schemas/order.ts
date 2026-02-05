import { defineField, defineType } from "sanity";
interface OrderItemParent {
  productType?: "apparel" | "stationery" | "mug";
  method?: string;
  [key: string]: unknown;
}
export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",

  fields: [
    /* ---------- ORDER NUMBER ---------- */
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    /* ---------- CUSTOMER INFO ---------- */
    defineField({
      name: "customer",
      title: "Customer Information",
      type: "object",
      fields: [
        defineField({
          name: "fullName",
          title: "Full Name",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "phone",
          title: "Phone Number",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: (Rule) => Rule.required().email(),
        }),
        defineField({
          name: "country",
          title: "Country",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "address",
          title: "Full Address",
          type: "text",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "customization",
          title: "Customization Details",
          type: "text",
        }),
      ],
    }),

    /* ---------- CURRENCY MODE ---------- */
    defineField({
      name: "currencyMode",
      title: "Currency Mode",
      type: "string",
      initialValue: "pk",
      options: {
        list: [
          { title: "PKR", value: "pk" },
          { title: "USD", value: "intl" },
        ],
      },
    }),

    /* ---------- ORDER ITEMS ---------- */
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineField({
          name: "item",
          title: "Order Item",
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "variantId",
              title: "Variant ID",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "size",
              title: "Size / Capacity",
              type: "string",
              description: "Apparel size or Mug capacity (e.g. 11oz)",
              hidden: ({ parent }) =>
                (parent as OrderItemParent)?.productType === "stationery",
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as OrderItemParent;
                  if (
                    (parent?.productType === "apparel" ||
                      parent?.productType === "mug") &&
                    !value
                  ) {
                    return "Size/Capacity is required for this item";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "color",
              title: "Color",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "colorCode",
              title: "Color Code",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "productType",
              title: "Product Type",
              type: "string",
              options: {
                list: ["apparel", "stationery", "mug"],
              },
            }),
            defineField({
              name: "pageType",
              title: "Page Type",
              type: "string",

              hidden: ({ parent }) =>
                (parent as OrderItemParent)?.productType !== "stationery",
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as OrderItemParent;
                  if (parent?.productType === "stationery" && !value) {
                    return "Page type is required for stationery";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            }),

            defineField({
              name: "price",
              title: "Price (Single Item)",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),

            defineField({
              name: "priceMode",
              title: "Price Mode",
              type: "string",
              initialValue: "pk",
              options: {
                list: [
                  { title: "PKR", value: "pk" },
                  { title: "USD", value: "intl" },
                ],
              },
            }),
          ],
        }),
      ],
    }),

    /* ---------- PAYMENT ---------- */
    defineField({
      name: "payment",
      title: "Payment Information",
      type: "object",
      fields: [
        defineField({
          name: "method",
          title: "Payment Method",
          type: "string",
          initialValue: "EasyPaisa",
        }),
        defineField({
          name: "receipt",
          title: "Payment Receipt",
          type: "file",
        }),
      ],
    }),

    /* ---------- TOTALS ---------- */
    defineField({
      name: "subtotal",
      title: "Subtotal",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "shippingFee",
      title: "Shipping Fee",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "total",
      title: "Total Amount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    /* ---------- STATUS ---------- */
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      initialValue: "pending",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
    }),
  ],

  preview: {
    select: {
      title: "customer.fullName",
      subtitle: "customer.email",
      country: "customer.country",
      orderNumber: "orderNumber",
    },
    prepare(selection) {
      const { title, subtitle, country, orderNumber } = selection;

      return {
        title: `${title} • ${orderNumber}`,
        subtitle: `${subtitle} • ${country}`,
      };
    },
  },
});
