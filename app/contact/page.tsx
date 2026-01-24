// app/contact/page.tsx
import ContactTableClient from "../components/ContactTableClient";
import { sanityClient } from "../lib/sanityClient";


export const revalidate = 0; // Fresh data for dashboard

const query = `*[_type == "contactForm"] | order(_createdAt desc){
  _id,
  _createdAt,
  name,
  email,
  phone,
  customization,
  message,
  referenceImage
}`;

export default async function ContactPage() {
  const contactData = await sanityClient.fetch(query);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Contact Submissions
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage and export your client inquiries.
            </p>
          </div>
        </header>

        <ContactTableClient initialData={contactData} />
      </div>
    </main>
  );
}
