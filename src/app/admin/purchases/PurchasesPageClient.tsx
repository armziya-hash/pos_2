"use client"
import React, { useState, useEffect } from 'react';
import { PackagePlus, Trash2, DatabaseZap } from 'lucide-react';
import { submitPurchase } from './actions';
import { useRouter } from 'next/navigation';

export default function PurchasesPageClient({ suppliers, products }: { suppliers: any[], products: any[] }) {
   const router = useRouter();
   const [cart, setCart] = useState<Array<{productId: string, name: string, quantity: number, costPrice: number}>>([]);
   const [supplierId, setSupplierId] = useState("");
   const [loading, setLoading] = useState(false);

   const addToCart = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const pid = e.target.value;
      if(!pid) return;
      const product = products.find(p => p.id === pid);
      if(product) {
          setCart([...cart, { productId: product.id, name: product.name, quantity: 1, costPrice: product.costPrice }]);
      }
      e.target.value = ""; // reset
   };

   const updateCart = (idx: number, field: string, val: number) => {
      const clone = [...cart];
      if (field === 'qty') clone[idx].quantity = val;
      if (field === 'cost') clone[idx].costPrice = val;
      setCart(clone);
   };

   const removeFromCart = (idx: number) => setCart(cart.filter((_, i) => i !== idx));

   const total = cart.reduce((acc, curr) => acc + (curr.quantity * curr.costPrice), 0);

   const handleSubmit = async () => {
       setLoading(true);
       const res = await submitPurchase(supplierId, JSON.stringify(cart));
       setLoading(false);
       if(res.success) {
           setCart([]);
           alert("Purchase Logged! Database Stock increased and Ledger updated successfully.");
           router.refresh();
       } else {
           alert("Error logging purchase");
       }
   }

   return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Inventory Purchases (Restock)</h1>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center"><PackagePlus size={16} /></span>
                  Add Products Built in Ledger Sync
                </h2>

                <select onChange={addToCart} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all mb-4 text-slate-700 font-medium cursor-pointer shadow-sm">
                   <option value="">+ Browse Database Products to Restock...</option>
                   {products.map(p => <option key={p.id} value={p.id}>{p.name} - (Current Cost: {p.costPrice})</option>)}
                </select>

                <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden">
                   <table className="w-full text-left text-sm text-slate-600">
                     <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                       <tr>
                         <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Item Name</th>
                         <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Qty</th>
                         <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Unit Cost</th>
                         <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold text-right">Subtotal</th>
                         <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold text-center">Del</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {cart.map((c, i) => (
                           <tr key={i} className="hover:bg-slate-50">
                             <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                             <td className="px-4 py-3">
                               <input type="number" min="1" value={c.quantity} onChange={(e) => updateCart(i, 'qty', Number(e.target.value))} className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center focus:ring-orange-500" />
                             </td>
                             <td className="px-4 py-3">
                               <input type="number" step="0.01" value={c.costPrice} onChange={(e) => updateCart(i, 'cost', Number(e.target.value))} className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-center focus:ring-orange-500" />
                             </td>
                             <td className="px-4 py-3 text-right font-bold text-slate-700">Rs. {(c.quantity * c.costPrice).toFixed(2)}</td>
                             <td className="px-4 py-3 text-center">
                                <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                             </td>
                           </tr>
                        ))}
                        {cart.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">Cart is empty</td></tr>}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>

          <div className="md:col-span-1">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Checkout Log</h2>
                
                <div className="mb-6 space-y-1">
                    <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Supplier Target (Optional)</label>
                    <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 shadow-inner outline-none focus:ring-2 focus:ring-blue-500">
                       <option value="">Miscellaneous / Direct Buy</option>
                       {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 flex flex-col items-center justify-center">
                   <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Total Expense</span>
                   <span className="text-3xl font-black text-rose-600 my-2">Rs. {total.toFixed(2)}</span>
                   <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                      <DatabaseZap size={12} /> Syncs to General Ledger
                   </div>
                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={cart.length === 0 || loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]">
                    {loading ? "Processing..." : "Commit Purchase"}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
