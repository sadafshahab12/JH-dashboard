"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ContactFormDoc } from "../types/contact";
import {
  Search,
  Calendar,
  Download,
  Copy,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ContactTableClient({
  initialData = [],
}: {
  initialData: ContactFormDoc[];
}) {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- Helpers ---
  const getSafeImageUrl = (
    image: ContactFormDoc["referenceImage"],
    width?: number,
  ) => {
    if (!image || !image.asset) return null;
    try {
      const builder = urlFor(image);
      return width ? builder.width(width).url() : builder.url();
    } catch (error) {
      console.error("Image builder error:", error);
      return null;
    }
  };

  // --- Filter Logic ---
  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const searchStr =
        `${item.name || ""} ${item.email || ""} ${item.phone || ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const itemDate = new Date(item._createdAt).getTime();
      let matchesDate = true;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start.getTime()) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end.getTime()) matchesDate = false;
      }
      return matchesSearch && matchesDate;
    });
  }, [initialData, searchTerm, startDate, endDate]);

  // Reset to page 1 when filters change
  useEffect(() => {
    const setPage = () => {
      setCurrentPage(1);
    };
    setPage();
  }, [searchTerm, startDate, endDate]);

  // --- Pagination Calculations ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // --- Actions ---
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");
    autoTable(doc, {
      head: [["Date", "Name", "Email", "Phone", "Customization", "Message"]],
      body: filteredData.map((i) => [
        new Date(i._createdAt).toLocaleDateString(),
        i.name || "N/A",
        i.email || "N/A",
        i.phone || "N/A",
        i.customization || "N/A",
        i.message || "N/A",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save("contact-submissions.pdf");
  };

  const downloadExcel = () => {
    const excelData = filteredData.map((item) => ({
      Date: new Date(item._createdAt).toLocaleString(),
      Name: item.name || "N/A",
      Email: item.email || "N/A",
      Phone: item.phone || "N/A",
      Customization: item.customization || "N/A",
      Message: item.message || "N/A",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    XLSX.writeFile(workbook, "contacts-export.xlsx");
  };

  const copyToClipboard = (item: ContactFormDoc) => {
    const text = `Client: ${item.name}\nEmail: ${item.email}\nPhone: ${item.phone || "N/A"}\nMessage: ${item.message}`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* --- Filter Bar --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm items-center">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email..."
            value={searchTerm}
            className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={startDate}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setStartDate(e.target.value)}
          />
          {startDate && (
            <button
              onClick={() => setStartDate("")}
              className="absolute right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={endDate}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEndDate(e.target.value)}
          />
          {endDate && (
            <button
              onClick={() => setEndDate("")}
              className="absolute right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={downloadPDF}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
        >
          <FileText className="h-4 w-4" /> PDF
        </button>

        <button
          onClick={downloadExcel}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
        >
          <Download className="h-4 w-4" /> Excel
        </button>
      </div>

      {/* --- Desktop Table View --- */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <th className="p-4 w-25">Reference</th>
              <th className="p-4 w-40">Client Detail</th>
              <th className="p-4 w-45">Contact</th>
              <th className="p-4 w-55">Requirements</th>
              <th className="p-4">Message</th>
              <th className="p-4 w-20 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((item) => {
              const thumb = getSafeImageUrl(item.referenceImage, 100);
              const full = getSafeImageUrl(item.referenceImage);
              return (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/50 transition-colors align-top"
                >
                  <td className="p-4">
                    {thumb && full ? (
                      <button
                        onClick={() => setSelectedImage(full)}
                        className="relative h-12 w-12 rounded-lg border border-slate-200 overflow-hidden"
                      >
                        <Image
                          src={thumb}
                          alt="thumbnail"
                          width={800}
                          height={800}
                          className="object-cover"
                        />
                      </button>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                        None
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 wrap-break-word">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(item._createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-blue-600 font-medium break-all">
                      {item.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.phone || "No Phone"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-700 wrap-break-word leading-relaxed whitespace-pre-wrap">
                      {item.customization}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-500 italic wrap-break-word leading-relaxed whitespace-pre-wrap">
                      {`"${item.message}"`}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => copyToClipboard(item)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Card View --- */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {paginatedData.map((item) => {
          const thumb = getSafeImageUrl(item.referenceImage, 100);
          const full = getSafeImageUrl(item.referenceImage);
          return (
            <div
              key={item._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-3 min-w-0">
                  {thumb && full && (
                    <button
                      onClick={() => setSelectedImage(full)}
                      className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 border"
                    >
                      <Image
                        src={thumb}
                        alt="ref"
                        width={800}
                        height={800}
                        className="object-cover"
                      />
                    </button>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 wrap-break-word">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {new Date(item._createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(item)}
                  className="p-2 bg-slate-50 border rounded-lg shrink-0"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Email
                  </p>
                  <p className="text-xs font-medium text-blue-600 break-all">
                    {item.email}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Phone
                  </p>
                  <p className="text-xs font-medium text-slate-700">
                    {item.phone || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Customization
                </p>
                <p className="text-sm text-slate-800 leading-relaxed wrap-break-word whitespace-pre-wrap">
                  {item.customization}
                </p>
              </div>

              <div className="bg-slate-900/5 p-4 rounded-xl leading-relaxed">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">
                  Inquiry Message
                </p>
                <p className="text-sm text-slate-600 italic leading-relaxed wrap-break-word whitespace-pre-wrap">
                  {`"${item.message}"`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Pagination Controls --- */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {filteredData.length}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first page, last page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-slate-900 text-white"
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                },
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* --- Full Image Modal --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition">
            <X className="h-8 w-8" />
          </button>
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
            <div className="relative w-full h-full max-h-[80vh]">
              <Image
                src={selectedImage}
                alt="Reference"
                width={800}
                height={800}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      {/* --- Empty State --- */}
      {filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
          <Search className="h-10 w-10 mb-4 opacity-20" />
          <p className="font-medium">No results found for your filters</p>
        </div>
      )}
    </div>
  );
}
