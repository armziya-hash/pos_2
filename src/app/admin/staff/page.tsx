import { PrismaClient } from "@prisma/client";
import { createStaff, toggleStaffStatus } from "./actions";

const prisma = new PrismaClient();

export default async function StaffPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Staff Management</h1>
       </div>

       {/* Form Section */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">+</span>
            Create New Account
          </h2>
          <form action={createStaff} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                 <input name="name" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="John Doe" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                 <input name="email" required type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="name@company.com" />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                 <input name="password" required type="password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Access Role</label>
                 <select name="role" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                    <option value="CASHIER">Cashier (POS Checkout)</option>
                    <option value="ADMIN">Administrator (Full Access)</option>
                 </select>
               </div>
             </div>
             <div className="pt-2">
               <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-8 rounded-xl shadow-md transition-all active:scale-[0.98]">
                   Save Staff Member
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
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Email</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Role</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                       {user.role}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                       {user.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <form action={async () => {
                       "use server";
                       await toggleStaffStatus(user.id, user.status);
                     }}>
                        <button type="submit" className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-colors ${user.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                          {user.status === 'ACTIVE' ? 'Disable Account' : 'Re-enable Account'}
                        </button>
                     </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No staff members found. Formulate a root Admin account above.</td></tr>
              )}
           </tbody>
         </table>
       </div>
    </div>
  )
}
