import { defineType, defineField } from "sanity";

export const mugSizeGuide = defineType({
  name: "mugSizeGuide",
  title: "Mug Size Guide",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Guide Title",
      type: "string",
      description: "e.g. Standard Ceramic Mug, Travel Mug Size Guide",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "image",
      title: "Guide Image",
      type: "image",
      description: "Mug ki outline ya dimension diagram",
      options: { hotspot: true },
    }),

    defineField({
      name: "sizes",
      title: "Mug Dimensions Table",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "sizeLabel",
              title: "Size Label",
              type: "string",
              description: "e.g. 11oz, 15oz, Small, Large",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "capacity",
              title: "Capacity (ml)",
              type: "number",
              description: "e.g. 325",
            }),
            defineField({
              name: "height",
              title: "Height (cm/in)",
              type: "string",
              description: "e.g. 9.5 cm",
            }),
            defineField({
              name: "diameter",
              title: "Diameter (cm/in)",
              type: "string",
              description: "e.g. 8 cm",
            }),
          ],
        },
      ],
    }),

    defineField({
      name: "materialInfo",
      title: "Material & Care",
      type: "object",
      fields: [
        defineField({
          name: "material",
          title: "Material Type",
          type: "string",
          description: "e.g. Ceramic, Stainless Steel, Glass",
        }),
        defineField({
          name: "isDishwasherSafe",
          title: "Dishwasher Safe?",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "isMicrowaveSafe",
          title: "Microwave Safe?",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),

    defineField({
      name: "usageTip",
      title: "Usage Tip",
      type: "string",
      description: "e.g. Perfect for a standard cup of morning coffee.",
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
