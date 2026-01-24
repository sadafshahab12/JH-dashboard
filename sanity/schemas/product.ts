import { defineType, defineField } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",

  fields: [
    /* ------------------------------
     Basic Info
    ------------------------------ */
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    /* ------------------------------
  Pricing Section (Updated)
------------------------------ */
    defineField({
      name: "pricing",
      title: "Pricing & Regions",
      type: "object",
      fields: [
        // Pakistan Pricing
        defineField({
          name: "pkPrice",
          title: "Pakistan Price (PKR)",
          type: "object",
          fields: [
            { name: "original", type: "number", title: "Original Price" },
            { name: "discount", type: "number", title: "Discount Price" },
          ],
        }),
        // International Pricing
        defineField({
          name: "intlPrice",
          title: "International Price (USD - Shipping Included)",
          type: "object",
          fields: [
            { name: "original", type: "number", title: "Original Price" },
            { name: "discount", type: "number", title: "Discount Price" },
          ],
        }),
      ],
    }),

    /* ------------------------------
     Category (Dynamic)
    ------------------------------ */
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),

    /* ------------------------------
     Product Labels (Multi-select)
    ------------------------------ */
    defineField({
      name: "badges",
      title: "Product Badges",
      type: "array",
      of: [{ type: "reference", to: [{ type: "badge" }] }],
      description: "Select multiple badges",
    }),

    /* ------------------------------
     Images
    ------------------------------ */
    defineField({
      name: "baseImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),

    /* ------------------------------
     Variants
    ------------------------------ */
    defineField({
      name: "variants",
      title: "Variants",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "id",
              title: "Variant ID",
              type: "string",
              validation: (Rule) => Rule.required(),
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
              name: "images",
              title: "Images",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
        },
      ],
    }),

    /* ------------------------------
     Sizes
    ------------------------------ */
    defineField({
      name: "availableSizes",
      title: "Available Sizes",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "XS", value: "XS" },
          { title: "S", value: "S" },
          { title: "M", value: "M" },
          { title: "L", value: "L" },
          { title: "XL", value: "XL" },
          { title: "XXL", value: "XXL" },
        ],
        layout: "grid",
      },
      validation: (Rule) => Rule.required().min(1),
    }),

    /* ------------------------------
     Description & Details
    ------------------------------ */
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "sizeGuide",
      title: "Size Guide",
      type: "reference",
      to: [{ type: "sizeGuide" }],
      description: "Select a size guide for this product",
    }),

    defineField({
      name: "fabricDetails",
      title: "Fabric Details",
      type: "array",
      of: [{ type: "string" }],
      description: "Add multiple details like fabric, weight, origin, etc.",
    }),

    defineField({
      name: "fit",
      title: "Fit",
      type: "string",
      options: {
        list: ["Regular", "Unisex", "Oversized", "Slim"],
      },
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "baseImage",
      originalPrice: "originalPrice",
      discountPrice: "discountPrice",
    },
    prepare(selection) {
      const { title, media, originalPrice, discountPrice } = selection;

      const priceText = discountPrice
        ? `PKR ${discountPrice} (PKR ${originalPrice})`
        : `PKR ${originalPrice}`;

      return {
        title,
        media,
        subtitle: `• ${priceText}`,
      };
    },
  },
});
