import { defineField, defineType } from "sanity";

export default defineType({
  name: "shippingCost",
  title: "Shipping Cost",
  type: "document",
  fields: [
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: {
        list: [
          { title: "PKR", value: "pk" },
          { title: "USD", value: "intl" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      description: "Leave blank for all cities in this country",
    }),
    defineField({
      name: "shippingFee",
      title: "Shipping Fee",
      type: "number",
      description: "Shipping cost in PKR (or in usd)",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "freeShippingMinOrder",
      title: "Free Shipping Minimum Quantity",
      type: "number",
      description:
        "Minimum number of items in cart to qualify for free shipping",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "note",
      title: "Note",
      type: "text",
      description: "Optional instructions or notes",
    }),
  ],
});
