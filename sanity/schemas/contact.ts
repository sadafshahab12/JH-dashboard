import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactForm",
  title: "Contact Form",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(50),
    }),

    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) =>
        Rule.required().email().error("Please enter a valid email address"),
    }),

    // ⭐ Added Phone Number Field
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "Optional contact number for the client",
      // Optional: Add regex validation if you want a specific format
      // validation: (Rule) => Rule.regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).error("Invalid phone number format")
    }),

    defineField({
      name: "customization",
      title: "Design Customization",
      type: "string",
      validation: (Rule) => Rule.required().min(5).max(150),
    }),

    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(500),
    }),

    defineField({
      name: "referenceImage",
      title: "Reference Image (Optional)",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Upload an image reference for custom design",
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "email",
      phone: "phone", // Added to selection
      media: "referenceImage",
    },
    prepare(selection) {
      const { title, subtitle, phone, media } = selection;
      return {
        title: title ?? "No Name",
        // Show both email and phone in the subtitle if phone exists
        subtitle: `${subtitle ?? "No Email"} ${phone ? `| ${phone}` : ""}`,
        media: media,
      };
    },
  },
});
