import { PrismaClient } from "@prisma/client";
import { createCategory } from "./actions";
import { Package } from "lucide-react";

const prisma = new PrismaClient();

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ 
    include: { store: true },
    orderBy: { name: 'asc' } 
  });
  const stores = await prisma.store.findMany();

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Categories</h1>
       </div>
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm"><Package size={16} /></span>
            Add Category
          </h2>
          <form action={createCategory} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                 <input name="name" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Beverages" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Store (Optional)</label>
                 <select name="storeId" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                    <option value="">Global Category (All Stores)</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name} - {s.location}</option>)}
                 </select>
               </div>
             </div>
             <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-8 rounded-xl shadow-md transition-all">Create</button>
          </form>
       </div>
       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl">
         <table className="w-full text-left text-sm text-slate-600">
           <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Category Name</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Store Binding</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                  <td className="px-6 py-4">
                     {cat.store ? <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{cat.store.name}</span> : <span className="text-slate-400 italic text-xs">Global</span>}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">No categories found.</td></tr>}
           </tbody>
         </table>
       </div>
    </div>
  )
}
