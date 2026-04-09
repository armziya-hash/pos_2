"use client"
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, PackageOpen } from 'lucide-react';

export default function CustomerDisplay() {
   const [state, setState] = useState<{cart: any[], total: number}>({ cart: [], total: 0 });

   useEffect(() => {
       const sync = () => {
           const data = localStorage.getItem("pos_customer_display");
           if (data) setState(JSON.parse(data));
       };
       sync(); // initial
       // The 'storage' event natively fires ONLY when localStorage is changed by ANOTHER tab in the same browser window
       // This perfectly mimics a POS setup where the cashier drags a tab to a secondary HDMI monitor.
       window.addEventListener('storage', sync);
       return () => window.removeEventListener('storage', sync);
   }, []);

   return (
      <div className="bg-slate-950 min-h-screen text-slate-100 flex p-8 font-sans overflow-hidden">
         {/* Left Side: Ads / Promotions running natively */}
         <div className="flex-1 flex flex-col justify-center items-center p-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-slate-800 shadow-2xl">
            <div className="absolute top-10 left-10 opacity-10"><Star size={200} /></div>
            <div className="absolute -bottom-20 -right-20 opacity-5"><ShoppingBag size={400} /></div>
            
            <div className="z-10 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
               <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 drop-shadow-lg tracking-tighter">
                  Welcome to POS Master
               </h1>
               <p className="text-2xl text-slate-400 font-medium tracking-wide">
                  Ask our cashier to join our Loyalty Program!
               </p>
               
               <div className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl max-w-xl mx-auto shadow-inner">
                  <h3 className="text-emerald-400 font-black tracking-widest uppercase mb-4">Live Updates</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">
                     Your items will appear on the right side as they are scanned by the terminal. Ensure details are correct.
                  </p>
               </div>
            </div>
         </div>

         {/* Right Side: The live mirrored Cart */}
         <div className="w-[500px] ml-8 flex flex-col">
             <div className="bg-slate-900 border border-slate-800 rounded-t-3xl shadow-2xl p-6 flex items-center justify-between z-10">
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                    <ShoppingBag className="text-emerald-400" /> Current Order
                 </h2>
                 <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-slate-700">
                    {state.cart.length} items
                 </span>
             </div>
             
             <div className="flex-1 bg-slate-800/50 border-l border-r border-slate-800 p-6 overflow-y-auto space-y-4">
                 {state.cart.map((item, idx) => (
                     <div key={idx} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex justify-between items-center shadow-lg animate-in slide-in-from-right-8 duration-300">
                         <div className="flex flex-col pr-4">
                             <h4 className="font-bold text-lg text-white mb-1 leading-tight">{item.name}</h4>
                             <p className="text-slate-400 font-medium text-sm">Rs. {item.sellingPrice.toFixed(2)} each</p>
                         </div>
                         <div className="flex flex-col items-end">
                             <div className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-black mb-1">x{item.quantity}</div>
                             <span className="text-emerald-400 font-black text-xl">{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                         </div>
                     </div>
                 ))}
                 {state.cart.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <PackageOpen size={64} className="mb-4" />
                        <p className="font-medium text-xl">Awaiting scan...</p>
                     </div>
                 )}
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-b-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)] p-8 z-10 mt-[-1px]">
                 <div className="flex justify-between items-end mb-2">
                     <span className="text-slate-400 font-bold uppercase tracking-widest leading-none">Net Payable</span>
                     <span className="text-6xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] leading-none">
                         {state.total.toFixed(2)}
                     </span>
                 </div>
                 <div className="w-full h-1 bg-slate-800 mt-6 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-400 animate-pulse w-full"></div>
                 </div>
             </div>
         </div>
      </div>
   )
}
