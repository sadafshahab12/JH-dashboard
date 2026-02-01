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

    // 💡 NEW: Product Type (Apparel vs Stationery)
    defineField({
      name: "productType",
      title: "Product Type",
      type: "string",
      options: {
        list: [
          { title: "Apparel (Clothing)", value: "apparel" },
          { title: "Stationery (Mugs, Notebooks, etc.)", value: "stationery" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
      initialValue: "apparel",
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),

    /* ------------------------------
       Pricing Section (Wahi hai jo aapka tha)
    ------------------------------ */
    defineField({
      name: "pricing",
      title: "Pricing & Regions",
      type: "object",
      fields: [
        defineField({
          name: "pkPrice",
          title: "Pakistan Price (PKR)",
          type: "object",
          fields: [
            { name: "original", type: "number", title: "Original Price" },
            { name: "discount", type: "number", title: "Discount Price" },
          ],
        }),
        defineField({
          name: "intlPrice",
          title: "International Price (USD)",
          type: "object",
          fields: [
            { name: "original", type: "number", title: "Original Price" },
            { name: "discount", type: "number", title: "Discount Price" },
          ],
        }),
      ],
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "badges",
      title: "Product Badges",
      type: "array",
      of: [{ type: "reference", to: [{ type: "badge" }] }],
    }),

    defineField({
      name: "baseImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),

    /* ------------------------------
       APPAREL ONLY FIELDS (Ab ye Stationery par hidden honge)
    ------------------------------ */
    defineField({
      name: "variants",
      title: "Color Variants",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "id", type: "string", title: "Variant ID" },
            { name: "color", type: "string", title: "Color" },
            { name: "colorCode", type: "string", title: "Color Code" },
            {
              name: "images",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
            },
          ],
        },
      ],
    }),

    defineField({
      name: "availableSizes",
      title: "Available Sizes",
      type: "array",
      hidden: ({ parent }) => parent?.productType === "stationery",
      of: [{ type: "string" }],
      options: {
        list: ["XS", "S", "M", "L", "XL", "XXL"],
        layout: "grid",
      },
    }),

    defineField({
      name: "fit",
      title: "Fit Options",
      type: "array",
      hidden: ({ parent }) => parent?.productType === "stationery",
      of: [{ type: "string" }],
    }),

    defineField({
      name: "sizeGuide",
      title: "Size Guide",
      type: "reference",
      to: [{ type: "sizeGuide" }],
      hidden: ({ parent }) => parent?.productType === "stationery",
    }),

    /* ------------------------------
       STATIONERY ONLY FIELDS (New fields for Mugs/Notebooks)
    ------------------------------ */
    defineField({
      name: "productSpecs",
      title: "Product Specifications (Mugs/Stationery)",
      type: "object",
      hidden: ({ parent }) => parent?.productType !== "stationery",
      fields: [
        {
          name: "material",
          type: "string",
          title: "Material (e.g., Ceramic / Paper 100gsm)",
        },
        {
          name: "dimensions",
          type: "string",
          title: "Dimensions / Capacity (e.g., 325ml / A5)",
        },
        {
          name: "other",
          type: "string",
          title: "Special Note (e.g., Microwave Safe)",
        },
      ],
    }),

    /* ------------------------------
       Common Details
    ------------------------------ */
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "fabricDetails",
      title: "Material/Fabric Details",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }) => parent?.productType === "stationery",
    }),

    defineField({
      name: "careInstructions",
      title: "Care Instructions",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "baseImage",
      pkOriginal: "pricing.pkPrice.original",
      pkDiscount: "pricing.pkPrice.discount",
      type: "productType",
    },
    prepare(selection) {
      const { title, media, pkOriginal, pkDiscount, type } = selection;
      const priceText = pkDiscount ? `PKR ${pkDiscount}` : `PKR ${pkOriginal}`;
      return {
        title: `[${type?.toUpperCase()}] ${title}`,
        media,
        subtitle: priceText,
      };
    },
  },
});
