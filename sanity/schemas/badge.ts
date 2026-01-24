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
  ],
});
