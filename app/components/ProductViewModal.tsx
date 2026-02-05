import Image from "next/image";
import { Package, X } from "lucide-react";
import { Order } from "../types/order";

export const ProductViewModal = ({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 text-left">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                Items Summary
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-1 uppercase tracking-tight">
                ID: {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm"
            >
              {/* PRODUCT IMAGE */}
              <div className="relative w-full sm:w-24 h-40 sm:h-24 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-50">
                {item.product.baseImage?.asset?.url ? (
                  <Image
                    src={item.product.baseImage.asset.url}
                    alt={item.product.name}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-[10px] font-bold">
                    NO IMAGE
                  </div>
                )}
              </div>

              {/* PRODUCT DETAILS */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-slate-900 text-base leading-tight">
                    {item.product.name}
                  </h4>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* PRODUCT TYPE BADGE */}
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-black uppercase">
                      {item.productType}
                    </span>

                    {/* DYNAMIC SPECIFICATIONS (Size / Capacity / PageType) */}
                    {item.productType === "stationery" ? (
                      <span className="px-2 py-1 bg-amber-50 border border-amber-100 rounded-md text-[10px] font-bold text-amber-700 uppercase">
                        Pages: {item.pageType || "Standard"}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase">
                        {item.productType === "mug" ? "Capacity" : "Size"}:{" "}
                        {item.size}
                      </span>
                    )}

                    {/* QUANTITY */}
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase">
                      Qty: {item.quantity}
                    </span>

                    {/* COLOR */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                      <div
                        className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
                        style={{ backgroundColor: item.colorCode }}
                      ></div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {item.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRICE SECTION */}
                <div className="mt-4 sm:mt-0 flex justify-between items-end border-t sm:border-none pt-3 sm:pt-0 border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Unit Price
                  </p>
                  <p className="font-black text-indigo-600 text-lg">
                    {item.priceMode === "intl" ? "$" : "PKR"}{" "}
                    {item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-6 border-t bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">
              Total Items:
            </span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-black">
              {order.items.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
