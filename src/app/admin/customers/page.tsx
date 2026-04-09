import { PrismaClient } from "@prisma/client";
import { createCustomer } from "./actions";
import { UsersRound } from "lucide-react";

const prisma = new PrismaClient();

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Customer Memberships</h1>
       </div>

       {/* Form Section */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm"><UsersRound size={16} /></span>
            Register Customer
          </h2>
          <form action={createCustomer} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                 <input name="name" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="Jane Doe" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Sri Lanka)</label>
                 <input name="phone" type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="07xxxxxx" />
               </div>
             </div>
             <div className="pt-2">
               <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-8 rounded-xl shadow-md transition-all">
                   Save Customer
               </button>
             </div>
          </form>
       </div>

       {/* List Section */}
       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm text-slate-600">
           <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Name</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Phone Number</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Loyalty Points</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{customer.name}</td>
                  <td className="px-6 py-4">{customer.phone || 'N/A'}</td>
                  <td className="px-6 py-4">
                     <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-black text-xs">
                       {customer.loyaltyPoints} PTS
                     </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No customers registered yet.</td></tr>
              )}
           </tbody>
         </table>
       </div>
    </div>
  )
}
