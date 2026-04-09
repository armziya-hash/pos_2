"use server"

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function submitPurchase(supplierId: string, itemsJSON: string) {
   try {
       const parsedItems = JSON.parse(itemsJSON) as Array<{productId: string, quantity: number, costPrice: number}>;
       if (parsedItems.length === 0) return { success: false, msg: "Cart empty" };

       let totalAmount = 0;
       parsedItems.forEach(i => totalAmount += (Number(i.quantity) * Number(i.costPrice)));

       await prisma.$transaction(async (tx) => {
           // 1. Create Purchase & Items
           const purchase = await tx.purchase.create({
               data: {
                   supplierId: supplierId || null,
                   totalAmount,
                   items: {
                       create: parsedItems.map(item => ({
                           productId: item.productId,
                           quantity: Number(item.quantity),
                           costPrice: Number(item.costPrice)
                       }))
                   }
               }
           });

           // 2. Sync physical Stock & overriding standard item cost price
           for (const item of parsedItems) {
               await tx.product.update({
                   where: { id: item.productId },
                   data: { 
                      stockQuantity: { increment: Number(item.quantity) },
                      costPrice: Number(item.costPrice)
                   }
               });
           }

           // 3. Automate Ledger Integration directly into EXEPENSE
           await tx.ledgerEntry.create({
              data: {
                  type: "EXPENSE",
                  amount: totalAmount,
                  description: `Inventory Stock Purchase`,
                  purchaseId: purchase.id
              }
           });
       });

       revalidatePath("/admin/purchases");
       revalidatePath("/admin/ledger");
       revalidatePath("/admin/products");
       return { success: true };
   } catch (error) {
       console.error("Critical Purchase transaction fail:", error);
       return { success: false, msg: "Database Error" };
   }
}
