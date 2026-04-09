"use client"
import React, { useState } from 'react';
import Papa from 'papaparse';
import { batchImportProducts } from '@/app/admin/products/actions';
import { UploadCloud, CheckCircle } from 'lucide-react';

export default function CsvImporter() {
   const [loading, setLoading] = useState(false);
   const [successMessage, setSuccessMessage] = useState("");

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file) return;

       setLoading(true);
       Papa.parse(file, {
           header: true,
           skipEmptyLines: true,
           complete: async (results) => {
               const res = await batchImportProducts(results.data);
               setLoading(false);
               if (res?.success) {
                   setSuccessMessage(`Successfully imported ${results.data.length} products!`);
                   setTimeout(() => setSuccessMessage(""), 5000);
               } else {
                   alert("Failed to import CSV: " + res?.msg);
               }
           }
       });
   };

   return (
       <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:bg-blue-50">
           {successMessage ? (
               <div className="flex flex-col items-center space-y-2 text-emerald-600">
                   <CheckCircle size={32} />
                   <p className="font-bold">{successMessage}</p>
               </div>
           ) : (
               <>
                   <UploadCloud size={40} className="text-blue-500 mb-3" />
                   <h3 className="font-semibold text-slate-700">Import Products via CSV</h3>
                   <p className="text-xs text-slate-500 mb-4 mt-1">Headers required: name, barcode, costPrice, sellingPrice, stockQuantity</p>
                   <label className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50 font-medium text-sm shadow-sm">
                       {loading ? "Importing Data..." : "Choose CSV File"}
                       <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
                   </label>
               </>
           )}
       </div>
   );
}
