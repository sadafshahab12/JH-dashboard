import { defineType, defineField } from "sanity";

export const badge = defineType({
  name: "badge",
  title: "Badge",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Badge Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "value",
      title: "Badge Value",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "color",
      title: "Badge Text Color",
      type: "string",
      description: "Hex code  (e.g. #ff0000 for red)",
      initialValue: "#000000", // Default black
    }),
  ],
});
