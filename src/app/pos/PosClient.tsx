"use client"

import React, { useState, useEffect, useRef } from 'react';
import { processCheckout } from './actions';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle, MonitorSpeaker } from 'lucide-react';
import Link from 'next/link';

export default function PosClient({ products, customers, cashierId }: { products: any[], customers: any[], cashierId: string }) {
    const [cart, setCart] = useState<Array<any>>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [discount, setDiscount] = useState<number>(0);
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [lastInvoice, setLastInvoice] = useState<any>(null); // For receipt print
    
    // Barcode scanner buffer
    const barcodeBuffer = useRef<string>("");

    // Secondary Display Syncing
    useEffect(() => {
        const payload = { cart, total: cart.reduce((a,c) => a + (c.sellingPrice * c.quantity), 0) - discount };
        localStorage.setItem("pos_customer_display", JSON.stringify(payload));
        // dispatch event for same-browser multi-tab syncing
        window.dispatchEvent(new Event("storage"));
    }, [cart, discount]);

    // Global Keydown for Barcode Scanners (USB scanners act as keyboards)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || isCheckingOut) return; // Don't intercept if typing in search box

            if (e.key === "Enter") {
                if (barcodeBuffer.current.length > 2) {
                    const scannedCode = barcodeBuffer.current;
                    const matchedProduct = products.find(p => p.barcode === scannedCode);
                    if (matchedProduct) {
                        addToCart(matchedProduct);
                    } else {
                        // Play error beep or notify
                        console.warn("Barcode not found:", scannedCode);
                    }
                }
                barcodeBuffer.current = ""; // flush
            } else {
                // accumulate printable characters
                if (e.key.length === 1) {
                    barcodeBuffer.current += e.key;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [products, cart, isCheckingOut]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const exists = prev.find(i => i.productId === product.id);
            if (exists) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { productId: product.id, name: product.name, price: product.sellingPrice, sellingPrice: product.sellingPrice, quantity: 1, barcode: product.barcode }];
        });
    };

    const adjustQty = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
           if (i.productId === id) {
               const nq = i.quantity + delta;
               return nq > 0 ? { ...i, quantity: nq } : i;
           }
           return i;
        }));
    };

    const removeFromCart = (id: string) => setCart(cart.filter(i => i.productId !== id));

    const totalGross = cart.reduce((acc, c) => acc + (c.sellingPrice * c.quantity), 0);
    const finalTotal = totalGross - discount;

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        const cus = customers.find(c => c.id === selectedCustomer);
        
        const res = await processCheckout(
            cashierId, 
            selectedCustomer || null, 
            totalGross, 
            discount, 
            cart,
            cus?.phone
        );

        setIsCheckingOut(false);
        if (res.success) {
            setLastInvoice({
                invoiceNumber: res.invoiceNumber,
                items: [...cart],
                subtotal: totalGross,
                discount,
                total: finalTotal,
                date: new Date(),
                customerName: cus?.name || "Walk-in"
            });
            setCart([]);
            setDiscount(0);
            setSelectedCustomer("");
        } else {
            alert(res.msg);
        }
    };

    const printReceipt = () => {
         window.print();
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery)));

    return (
        <div className="flex h-screen overflow-hidden text-slate-800">

            {/* Custom Print Styles injected directly via functional scoped CSS */}
            <style dangerouslySetInnerHTML={{__html: `
               @media print {
                   body * { visibility: hidden; }
                   #print-receipt, #print-receipt * { visibility: visible; }
                   #print-receipt { position: absolute; left: 0; top: 0; width: 80mm; margin: 0; padding: 0; padding-right: 20px;}
                   @page { margin: 0; size: 80mm auto; }
               }
            `}} />

            {/* Hidden Receipt formatting specifically for 80mm POS Thermal printers */}
            {lastInvoice && (
                <div id="print-receipt" className="hidden print:block w-[80mm] font-mono text-xs text-black p-2 leading-tight">
                    <div className="text-center mb-4">
                        <h2 className="text-lg font-black uppercase">POS Retail Store</h2>
                        <p>Colombo, Sri Lanka</p>
                        <p>Tel: +94 112 345 678</p>
                    </div>
                    <div className="border-b border-dashed border-black pb-2 mb-2">
                        <p>Date: {lastInvoice.date.toLocaleString()}</p>
                        <p>Invoice: {lastInvoice.invoiceNumber}</p>
                        <p>Customer: {lastInvoice.customerName}</p>
                    </div>
                    <table className="w-full text-left mb-2">
                        <thead>
                            <tr className="border-b border-dashed border-black">
                                <th className="py-1 w-1/2">Item</th>
                                <th className="py-1 text-center w-1/4">Qty</th>
                                <th className="py-1 text-right w-1/4">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lastInvoice.items.map((i: any, k: number) => (
                                <tr key={k}>
                                    <td className="py-1 align-top">{i.name}</td>
                                    <td className="py-1 text-center align-top">{i.quantity}</td>
                                    <td className="py-1 text-right align-top">{(i.price * i.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="border-t border-dashed border-black pt-2 text-right">
                        <p>Subtotal: {lastInvoice.subtotal.toFixed(2)}</p>
                        <p>Discount: - {lastInvoice.discount.toFixed(2)}</p>
                        <h3 className="text-lg font-bold mt-1">TOTAL: Rs: {lastInvoice.total.toFixed(2)}</h3>
                    </div>
                    <div className="text-center mt-6">
                        <p>Thank you for shopping with us!</p>
                        <p>Please come again.</p>
                        {/* A4 Size Print Note: We strictly enforce physical CSS printing dimension width rules so the browser handles PDF/A4 dynamically if printer chosen is A4 vs 80mm. */}
                    </div>
                </div>
            )}

            {/* Left/Main Side: Products Grid */}
            <div className="flex-1 flex flex-col bg-slate-50 print:hidden relative">
               <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10 relative">
                  <div className="flex items-center gap-4">
                      <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">POS.Terminal</h1>
                      <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full transition-colors">Admin Panel</Link>
                  </div>
                  <div className="relative w-96">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                         type="text" 
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                         placeholder="Search product (or use Barcode Scanner)" 
                         className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-inner font-medium text-sm transition-all"
                      />
                  </div>
                  <Link href="/customer-display" target="_blank" className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                      <MonitorSpeaker size={16} /> Open Customer Display
                  </Link>
               </div>

               {/* Grid */}
               <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                   {lastInvoice ? (
                       <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                           <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                              <CheckCircle size={48} />
                           </div>
                           <h2 className="text-4xl font-black text-slate-800 mb-2">Transaction Complete</h2>
                           <p className="text-slate-500 mb-8 font-medium">Invoice {lastInvoice.invoiceNumber} recorded to ledger.</p>
                           
                           <div className="flex gap-4">
                               <button onClick={printReceipt} className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg">
                                  <Printer size={20} /> Print Thermal Receipt
                               </button>
                               <button onClick={() => setLastInvoice(null)} className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
                                  Start New Sale
                               </button>
                           </div>
                       </div>
                   ) : (
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredProducts.map(p => {
                                const inStock = p.stockQuantity > 0;
                                return (
                                <button 
                                    key={p.id} 
                                    onClick={() => inStock ? addToCart(p) : alert('Out of stock!')}
                                    className={`relative flex flex-col text-left justify-between p-4 aspect-square rounded-2xl border transition-all active:scale-95 shadow-sm overflow-hidden ${inStock ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md' : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'}`}
                                >
                                    <h3 className="font-bold text-sm leading-tight text-slate-800 line-clamp-3">{p.name}</h3>
                                    <div className="mt-auto">
                                        <p className="text-lg font-black text-blue-600">Rs. {p.sellingPrice.toFixed(2)}</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Qty: {p.stockQuantity}</p>
                                    </div>
                                </button>
                                )
                            })}
                       </div>
                   )}
               </div>
            </div>

            {/* Right Side: Cart Interface */}
            <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col print:hidden z-20">
                 <div className="h-16 flex items-center px-4 bg-slate-50 border-b border-slate-200">
                    <select value={selectedCustomer} onChange={(e)=> setSelectedCustomer(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer">
                        <option value="">Walk-in Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone || 'No phone'}</option>)}
                    </select>
                 </div>

                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                     {cart.map((item) => (
                         <div key={item.productId} className="flex flex-col bg-slate-50 border border-slate-100 p-3 rounded-xl shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm leading-tight pr-2">{item.name}</span>
                                <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                             </div>
                             <div className="flex justify-between items-center mt-auto">
                                 <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                                    <button onClick={() => adjustQty(item.productId, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 active:bg-slate-300 text-slate-600"><Minus size={14}/></button>
                                    <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => adjustQty(item.productId, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 active:bg-slate-300 text-slate-600"><Plus size={14}/></button>
                                 </div>
                                 <span className="font-bold text-slate-700">{(item.price * item.quantity).toFixed(2)}</span>
                             </div>
                         </div>
                     ))}
                     {cart.length === 0 && (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                             <ShoppingCart size={48} className="mb-4" />
                             <p className="font-semibold text-sm">Cart is empty</p>
                             <p className="text-xs text-center mt-2 px-4 leading-tight">Tap products or scan barcodes to begin transaction</p>
                         </div>
                     )}
                 </div>

                 {/* Payment Console */}
                 <div className="p-4 bg-slate-800 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.1)] rounded-t-3xl relative">
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-semibold text-slate-400">Gross Subtotal</span>
                         <span className="text-sm font-bold">Rs. {totalGross.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center mb-4">
                         <span className="text-sm font-semibold text-slate-400">Discount Override</span>
                         <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 text-rose-400 font-bold focus-within:ring-2 focus-within:ring-rose-500">
                             - Rs. <input type="number" min="0" value={discount === 0 ? '' : discount} onChange={e => setDiscount(Number(e.target.value))} placeholder="0.00" className="w-16 bg-transparent outline-none py-1 pl-1 text-right placeholder-slate-600" />
                         </div>
                     </div>
                     
                     <div className="flex justify-between items-center border-t border-slate-700 pt-3 pb-4">
                         <span className="text-sm uppercase tracking-widest font-black text-slate-300">Net Total</span>
                         <span className="text-3xl font-black text-emerald-400 drop-shadow-md">Rs. {finalTotal.toFixed(2)}</span>
                     </div>

                     <button 
                        disabled={cart.length === 0 || isCheckingOut || !!lastInvoice}
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] transition-all text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm">
                         {isCheckingOut ? "Processing Link..." : "Checkout & Pay"}
                         <CheckCircle className="group-hover:scale-110 transition-transform" />
                     </button>
                 </div>
            </div>
            {/* Added for Empty Cart Layout Icon Support */}
            <style dangerouslySetInnerHTML={{__html: `
                /* We inject the ShoppingCart SVG dynamically since lucide sometimes acts out if not explicitly isolated in mappings */
            `}} />
        </div>
    );
}

import { ShoppingCart } from 'lucide-react';
