import Link from "next/link";
import { LayoutDashboard, Users, ShoppingCart, Store, Package, UsersRound, Truck } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Staff Management", href: "/admin/staff", icon: Users },
    { name: "Customers", href: "/admin/customers", icon: UsersRound },
    { name: "Suppliers", href: "/admin/suppliers", icon: Truck },
    { name: "Stores", href: "/admin/stores", icon: Store },
    { name: "Categories", href: "/admin/categories", icon: Package },
    { name: "Products", href: "/admin/products", icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 w-full">
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 shadow-sm flex flex-col z-10 transition-all">
         <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">POS.</h1>
         </div>
         <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-medium transition-all duration-200 ease-in-out">
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
         </nav>
         <div className="p-4 border-t border-slate-200">
           <div className="text-sm rounded-lg p-3 bg-slate-100 flex items-center justify-between text-slate-700 shadow-inner">
             <span className="font-semibold truncate w-32">{session.user?.name || 'Administrator'}</span>
             <Link href="/api/auth/signout" className="text-xs text-red-500 font-bold hover:underline">Out</Link>
           </div>
         </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative w-full h-full">
          <div className="p-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            {children}
          </div>
      </main>
    </div>
  )
}
