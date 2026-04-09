import { PrismaClient } from "@prisma/client";
import { createManualJournal } from "./actions";
import { BookOpen, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";

const prisma = new PrismaClient();

export default async function LedgerPage() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { date: 'desc' }
  });

  // Balance computation engine
  let income = 0;
  let expenses = 0;
  
  entries.forEach(e => {
     if (e.type === 'INCOME' || e.type === 'CREDIT_NOTE') income += e.amount;
     if (e.type === 'EXPENSE' || e.type === 'DEBIT_NOTE') expenses += e.amount;
  });

  const exactBalance = income - expenses;

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">General Ledger</h1>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl shadow-sm">
             <div className="flex items-center gap-2 text-emerald-600 mb-2">
                 <TrendingUp size={18} />
                 <h3 className="font-semibold text-sm uppercase tracking-wider">Gross Incomes</h3>
             </div>
             <p className="text-3xl font-black text-emerald-700">Rs. {income.toFixed(2)}</p>
          </div>
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl shadow-sm">
             <div className="flex items-center gap-2 text-rose-600 mb-2">
                 <TrendingDown size={18} />
                 <h3 className="font-semibold text-sm uppercase tracking-wider">Total Expenses</h3>
             </div>
             <p className="text-3xl font-black text-rose-700">Rs. {expenses.toFixed(2)}</p>
          </div>
          <div className={`${exactBalance >= 0 ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-red-50 border-red-100 text-red-700'} border p-6 rounded-2xl shadow-sm`}>
             <div className="flex items-center gap-2 mb-2">
                 <BookOpen size={18} />
                 <h3 className="font-semibold text-sm uppercase tracking-wider">Operating Balance</h3>
             </div>
             <p className="text-3xl font-black">Rs. {exactBalance.toFixed(2)}</p>
          </div>
       </div>

       {/* Journal Entry Form */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center"><RefreshCcw size={16} /></span>
            Add Manual Journal (Note)
          </h2>
          <form action={createManualJournal} className="space-y-4">
             <div className="grid grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Journal Type</label>
                 <select name="type" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500 outline-none transition-all">
                    <option value="CREDIT_NOTE">Credit Note (Adds to Income)</option>
                    <option value="DEBIT_NOTE">Debit Note (Adds to Expense)</option>
                    <option value="INCOME">Manual Income</option>
                    <option value="EXPENSE">Manual Expense</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Value</label>
                 <input name="amount" required type="number" step="0.01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500 outline-none transition-all" placeholder="0.00" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                 <input name="description" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500 outline-none transition-all" placeholder="Reason for adjustment" />
               </div>
             </div>
             <div className="pt-2">
               <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-8 rounded-xl shadow-md transition-all">
                   Submit Journal Entry
               </button>
             </div>
          </form>
       </div>

       {/* Book Records */}
       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm text-slate-600">
           <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Date Logged</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Entry Type</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Description Notation</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Value Impact</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {entries.map(entry => {
                const isPositive = entry.type === 'INCOME' || entry.type === 'CREDIT_NOTE';
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{entry.date.toLocaleString()}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                         {entry.type.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-4">{entry.description || '-'} {entry.transactionId ? '(POS Sale)' : ''} {entry.purchaseId ? '(Supplier Return)' : ''}</td>
                    <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {isPositive ? '+' : '-'} {entry.amount.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
              {entries.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Ledger is currently pristine. Try adding a journal entry!</td></tr>
              )}
           </tbody>
         </table>
       </div>
    </div>
  )
}
