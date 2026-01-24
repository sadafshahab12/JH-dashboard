import { defineType, defineField } from "sanity";

export const sizeGuide = defineType({
  name: "sizeGuide",
  title: "Size Guide",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Guide Title",
      type: "string",
      description: "e.g. T-Shirt Size Guide, Hoodie Size Guide",
      validation: (Rule) => Rule.required(),
    }),

    // 👕 Recognition Image
    defineField({
      name: "image",
      title: "Guide Image",
      type: "image",
      description:
        "Optional image for recognizing the product type (e.g. t-shirt outline)",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "sizes",
      title: "Sizes Table",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "size",
              title: "Size",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "chest",
              title: "Chest (in)",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "length",
              title: "Length (in)",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
