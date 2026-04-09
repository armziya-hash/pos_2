import { PrismaClient } from "@prisma/client";
import PurchasesPageClient from "./PurchasesPageClient";

const prisma = new PrismaClient();

export default async function PurchasesPage() {
   const suppliers = await prisma.supplier.findMany();
   const products = await prisma.product.findMany({ select: { id: true, name: true, costPrice: true } });

   return <PurchasesPageClient suppliers={suppliers} products={products} />;
}
