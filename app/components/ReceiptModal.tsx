import { ClipboardCheck, Download, X } from "lucide-react";
import Image from "next/image";

const ReceiptModal = ({
  url,
  orderNumber,
  onClose,
}: {
  url: string;
  orderNumber: string;
  onClose: () => void;
}) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `receipt-${orderNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-emerald-500" /> Payment
            Evidence
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 bg-slate-100 flex justify-center max-h-[60vh] overflow-auto">
          <Image
            src={url}
            alt="Receipt"
            width={800}
            height={800}
            className="max-w-full h-auto rounded-lg shadow-lg ring-4 ring-white"
          />
        </div>
        <div className="p-5 border-t bg-white flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
          >
            <div className="p-1 bg-white/20 rounded-lg" title="SAVE RECEIPT">
              <Download size={18} />
            </div>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReceiptModal;
