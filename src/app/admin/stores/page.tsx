import { PrismaClient } from "@prisma/client";
import { createStore } from "./actions";
import { Store } from "lucide-react";

const prisma = new PrismaClient();

export default async function StoresPage() {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Store Fronts</h1>
       </div>
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center text-sm"><Store size={16} /></span>
            Register Branch
          </h2>
          <form action={createStore} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                 <input name="name" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Main Branch" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
                 <input name="currencySymbol" type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="LKR" defaultValue="LKR" />
               </div>
             </div>
             <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Location Details</label>
                 <input name="location" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Colombo 01" />
             </div>
             <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-8 rounded-xl shadow-md transition-all">Save Store</button>
          </form>
       </div>
       <div className="grid grid-cols-3 gap-6">
          {stores.map(store => (
            <div key={store.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <h3 className="font-bold text-lg text-slate-800">{store.name}</h3>
               <p className="text-slate-500 text-sm mt-1">{store.location}</p>
               <div className="mt-4 bg-slate-50 text-slate-600 text-xs py-2 px-3 rounded-lg font-mono border border-slate-100 uppercase font-semibold">
                  Currency: {store.currencySymbol}
               </div>
            </div>
          ))}
       </div>
    </div>
  )
}
