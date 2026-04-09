import { PrismaClient } from "@prisma/client";
import { createSupplier } from "./actions";
import { Truck } from "lucide-react";

const prisma = new PrismaClient();

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Suppliers Network</h1>
       </div>

       {/* Form Section */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center text-sm"><Truck size={16} /></span>
            Register Supplier
          </h2>
          <form action={createSupplier} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Company / Name</label>
                 <input name="name" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all" placeholder="ABC Distributors" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                 <input name="contact" type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all" placeholder="Hotline" />
               </div>
             </div>
             <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Location Address</label>
                 <input name="address" type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all" placeholder="Warehouse location" />
             </div>
             <div className="pt-2">
               <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-8 rounded-xl shadow-md transition-all">
                   Save Supplier
               </button>
             </div>
          </form>
       </div>

       {/* List Section */}
       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm text-slate-600">
           <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Supplier Name</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Contact</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Address</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {suppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{supplier.name}</td>
                  <td className="px-6 py-4">{supplier.contact || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-500">{supplier.address || 'N/A'}</td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No suppliers registered yet.</td></tr>
              )}
           </tbody>
         </table>
       </div>
    </div>
  )
}
