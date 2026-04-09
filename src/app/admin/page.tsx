import { PrismaClient } from "@prisma/client";
import { Users, AlertCircle, ShoppingBag } from "lucide-react";

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const staffCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const transactionCount = await prisma.transaction.count();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Business Dashboard</h1>
        <span className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-500 shadow-sm border border-slate-100">
           Last synced: Just now
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
             <Users size={20} className="text-blue-500" />
             <h3 className="font-medium tracking-wide uppercase text-sm">System Users</h3>
          </div>
          <p className="text-4xl font-black text-slate-800">{staffCount}</p>
          <div className="mt-4 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">Active Staff</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
             <ShoppingBag size={20} className="text-indigo-500" />
             <h3 className="font-medium tracking-wide uppercase text-sm">Total Products</h3>
          </div>
          <p className="text-4xl font-black text-slate-800">{productCount}</p>
          <div className="mt-4 text-xs font-semibold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded">Inventory Items</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <AlertCircle size={120} />
          </div>
          <div className="flex items-center gap-3 text-slate-500 mb-4">
             <AlertCircle size={20} className="text-rose-500" />
             <h3 className="font-medium tracking-wide uppercase text-sm">Sales Transacted</h3>
          </div>
          <p className="text-4xl font-black text-slate-800">{transactionCount}</p>
          <div className="mt-4 text-xs font-semibold text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded">Recorded Invoices</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mt-8 flex flex-col items-center justify-center min-h-[300px]">
         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard className="text-blue-500" size={32} />
         </div>
         <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to POS Master</h2>
         <p className="text-slate-500 text-center max-w-md">
           Use the sidebar to navigate into Staff Management, Customers, or begin importing your product inventory.
         </p>
      </div>
    </div>
  );
}

// Need to import this icon specifically for the empty state
import { LayoutDashboard } from "lucide-react";
