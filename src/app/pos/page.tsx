import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PosClient from "./PosClient";

const prisma = new PrismaClient();

export default async function POSPage() {
   const session = await getServerSession(authOptions);
   if (!session) redirect("/api/auth/signin");

   const products = await prisma.product.findMany();
   const customers = await prisma.customer.findMany();

   return <PosClient products={products} customers={customers} cashierId={session?.user?.id as string} />
}
