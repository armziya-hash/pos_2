import { PrismaClient } from "@prisma/client";
import { FileText, Calendar, Filter } from "lucide-react";

const prisma = new PrismaClient();

// Next.js 15: searchParams promise resolution
type Props = {
  searchParams: Promise<{ start?: string; end?: string; type?: string }>;
};

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const start = params.start ? new Date(params.start) : new Date(new Date().setHours(0,0,0,0)); // Default today
  const end = params.end ? new Date(params.end) : new Date(); // Default now
  end.setHours(23, 59, 59, 999);

  const reportType = params.type || "DAY_BOOK";

  // Data fetching based on filters
  let transactions: any[] = [];
  let ledgers: any[] = [];
  let purchases: any[] = [];

  if (reportType === "DAY_BOOK" || reportType === "SALES") {
     transactions = await prisma.transaction.findMany({
         where: { date: { gte: start, lte: end } },
         include: { user: true, customer: true, items: { include: { product: true } } },
         orderBy: { date: 'desc' }
     });
  }
  
  if (reportType === "DAY_BOOK" || reportType === "LEDGER") {
     ledgers = await prisma.ledgerEntry.findMany({
         where: { date: { gte: start, lte: end } },
         orderBy: { date: 'desc' }
     });
  }

  if (reportType === "PURCHASE") {
     purchases = await prisma.purchase.findMany({
         where: { date: { gte: start, lte: end } },
         include: { supplier: true },
         orderBy: { date: 'desc' }
     });
  }

  // Statistical rollups
  const totalSalesRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalIncomes = ledgers.filter(l => l.type === 'INCOME' || l.type === 'CREDIT_NOTE').reduce((s, l) => s + l.amount, 0);
  const totalExpenses = ledgers.filter(l => l.type === 'EXPENSE' || l.type === 'DEBIT_NOTE').reduce((s, l) => s + l.amount, 0);

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dynamic Reporting & Export</h1>
       </div>

       {/* Configuration Panel */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-4xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center"><Filter size={16} /></span>
            Report Configuration
          </h2>
          <form method="GET" action="/admin/reports" className="space-y-4">
             <div className="grid grid-cols-3 gap-6">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Report Module</label>
                 <select name="type" defaultValue={reportType} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                    <option value="DAY_BOOK">Master Day Book (All Financials)</option>
                    <option value="SALES">Termianl Item Sales</option>
                    <option value="PURCHASE">Stock Purchases</option>
                    <option value="LEDGER">Journal & Ledger Entries</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                 <input name="start" type="date" defaultValue={start.toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                 <input name="end" type="date" defaultValue={end.toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
               </div>
             </div>
             <div className="pt-2 flex gap-4">
               <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
                   <Calendar size={18}/> Generate Target Report
               </button>
               {/* Client side print invoke */}
               <button type="button" onClick={() => {/* eslint-disable-next-line bypasses server side restriction for testing, requires real client comp if interactive */}} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 py-2.5 px-8 rounded-xl transition-all flex items-center gap-2">
                   <FileText size={18}/> Export / Print
               </button>
             </div>
          </form>
       </div>

       {/* Analytical Summaries */}
       {reportType === "DAY_BOOK" && (
           <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col items-center">
                 <span className="text-xs uppercase tracking-widest font-bold text-emerald-600 mb-1">Sales Volume in Range</span>
                 <span className="text-2xl font-black text-emerald-800">Rs. {totalSalesRevenue.toFixed(2)}</span>
              </div>
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex flex-col items-center">
                 <span className="text-xs uppercase tracking-widest font-bold text-sky-600 mb-1">Ledger Incomes</span>
                 <span className="text-2xl font-black text-sky-800">Rs. {totalIncomes.toFixed(2)}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex flex-col items-center">
                 <span className="text-xs uppercase tracking-widest font-bold text-rose-600 mb-1">Ledger Expenses Tracker</span>
                 <span className="text-2xl font-black text-rose-800">Rs. {totalExpenses.toFixed(2)}</span>
              </div>
           </div>
       )}

       {/* Rendered Dynamic Table blocks based on report parameter */}
       {reportType === "SALES" || reportType === "DAY_BOOK" ? (
       <div className="w-full mb-8">
           <h3 className="font-bold text-lg mb-4 text-slate-800 border-l-4 border-indigo-500 pl-3">Sales Ledger Extraction</h3>
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-100/50 text-slate-500 border-b border-slate-200">
                 <tr>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Invoice No.</th>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Time</th>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Customer</th>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Pos Handler</th>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase text-right">Extracted Total</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {transactions.map(t =>(
                    <tr key={t.id}>
                       <td className="px-6 py-3 font-mono font-bold text-indigo-600">{t.invoiceNumber}</td>
                       <td className="px-6 py-3 text-xs">{t.date.toLocaleString()}</td>
                       <td className="px-6 py-3">{t.customer?.name || "Walk-in"}</td>
                       <td className="px-6 py-3">{t.user?.name}</td>
                       <td className="px-6 py-3 text-right font-black text-slate-800">Rs. {t.amount} {t.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No Sales Data</td></tr>}
               </tbody>
             </table>
           </div>
       </div>
       ) : null}

       {reportType === "LEDGER" || reportType === "DAY_BOOK" ? (
       <div className="w-full mb-8">
           <h3 className="font-bold text-lg mb-4 text-slate-800 border-l-4 border-emerald-500 pl-3">Primary Journal Extractions</h3>
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-100/50 text-slate-500 border-b border-slate-200">
                 <tr>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Direction</th>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Time</th>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Description</th>
                   <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase text-right">Gross Effect</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {ledgers.map(l => {
                    const isPositive = l.type === 'INCOME' || l.type === 'CREDIT_NOTE';
                    return (
                    <tr key={l.id}>
                       <td className="px-6 py-3 font-mono font-bold">
                           <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{l.type}</span>
                       </td>
                       <td className="px-6 py-3 text-xs">{l.date.toLocaleString()}</td>
                       <td className="px-6 py-3 text-sm">{l.description || '-'}</td>
                       <td className={`px-6 py-3 text-right font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>Rs. {l.amount.toFixed(2)}</td>
                    </tr>
                  )})}
                  {ledgers.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">No Ledger Journals</td></tr>}
               </tbody>
             </table>
           </div>
       </div>
       ) : null}

    </div>
  )
}
