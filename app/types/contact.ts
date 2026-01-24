export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  customization: string;
  message: string;
  referenceImageUrl?: string;
  _createdAt: string;
}
// Define the exact shape based on your Sanity Schema
export interface ContactFormDoc {
  _id: string;
  _createdAt: string;
  name: string;
  email: string;
  phone?: string; // Included from schema
  customization: string;
  message: string;
  referenceImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
}
