import { PrismaClient } from "@prisma/client";
import { createProduct } from "./actions";
import { ShoppingCart } from "lucide-react";
import CsvImporter from "@/components/CsvImporter";
import BarcodeRenderer from "@/components/BarcodeRenderer";

const prisma = new PrismaClient();

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, supplier: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const categories = await prisma.category.findMany();
  const suppliers = await prisma.supplier.findMany();

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-800">Inventory Management</h1>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm"><ShoppingCart size={16} /></span>
                Add Single Product
              </h2>
              <form action={createProduct} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Name</label>
                     <input name="name" required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Coca Cola 500ml" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Barcode (Optional)</label>
                     <input name="barcode" type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Leave empty to auto-generate" />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cost Price</label>
                     <input name="costPrice" required type="number" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0.00" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Selling Price</label>
                     <input name="sellingPrice" required type="number" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0.00" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stock QTY</label>
                     <input name="stockQuantity" required type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="100" />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Category</label>
                     <select name="categoryId" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <option value="">Uncategorized</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Supplier</label>
                     <select name="supplierId" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <option value="">No Supplier Link</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                   </div>
                 </div>

                 <div className="pt-2">
                   <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-8 rounded-lg shadow-md transition-all">Add Product</button>
                 </div>
              </form>
           </div>
           
           <div className="md:col-span-1">
              <CsvImporter />
           </div>
       </div>

       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm text-slate-600">
           <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Item / Scan / Barcode</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Category</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Prices (Cost/Sell)</th>
               <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">In Stock</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <p className="font-bold text-slate-900 mb-2 text-base">{product.name}</p>
                     <BarcodeRenderer value={product.barcode || ""} />
                  </td>
                  <td className="px-6 py-4">
                     {product.category ? <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-100">{product.category.name}</span> : <span className="text-slate-400">None</span>}
                     <div className="mt-2 text-[10px] uppercase text-slate-400 tracking-wider">
                       Supplier: {product.supplier?.name || "None"}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                       <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded w-fit border border-rose-100">Cost: {product.costPrice}</span>
                       <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit border border-emerald-100">Sell: {product.sellingPrice}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <span className={`text-lg font-black ${product.stockQuantity < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {product.stockQuantity}
                     </span>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No products imported. Use the CSV Importer or Form above.</td></tr>}
           </tbody>
         </table>
       </div>
    </div>
  )
}
