import { PrismaClient } from "@prisma/client";
import { ReceiptText, Filter } from "lucide-react";

const prisma = new PrismaClient();

export default async function SalesHistoryPage() {
  const sales = await prisma.transaction.findMany({
    include: { customer: true, user: true, items: { include: { product: true } } },
    orderBy: { date: 'desc' }
  });

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Sales Transactions List</h1>
         <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm">
            <Filter size={16}/> Filter by Date Range
         </button>
       </div>

       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm text-slate-600">
           <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Invoice No.</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Date & Time</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Customer Assig.</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Cashier</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Invoice Total</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {sales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                         <ReceiptText size={16} className="text-slate-400" />
                         <span className="font-bold font-mono text-indigo-600">{sale.invoiceNumber}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">{sale.date.toLocaleString()}</td>
                  <td className="px-6 py-4">{sale.customer?.name || <span className="text-slate-400 italic font-mono">Walk-in Customer</span>}</td>
                  <td className="px-6 py-4">{sale.user.name}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-800">
                     Rs. {sale.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No sales transactions have been piped from the POS terminal yet.</td></tr>
              )}
           </tbody>
         </table>
       </div>
    </div>
  )
}
