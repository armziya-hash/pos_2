"use server"

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function processCheckout(
    cashierId: string, 
    customerId: string | null, 
    grossTotal: number, 
    discount: number, 
    items: Array<{productId: string, quantity: number, price: number}>,
    customerPhone?: string
) {
   if (items.length === 0) return { success: false, msg: "Empty cart" };

   const finalAmount = grossTotal - discount;
   const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random()*1000)}`;

   try {
       await prisma.$transaction(async (tx) => {
           // 1. Log Transaction Sale Core
           const sale = await tx.transaction.create({
               data: {
                   invoiceNumber,
                   userId: cashierId,
                   customerId: customerId || null,
                   totalAmount: finalAmount,
                   discount: discount,
                   items: {
                       create: items.map(i => ({
                           productId: i.productId,
                           quantity: i.quantity,
                           priceAtSale: i.price
                       }))
                   }
               }
           });

           // 2. Adjust Live Inventory Stock (Deduction)
           for (const i of items) {
               await tx.product.update({
                   where: { id: i.productId },
                   data: { stockQuantity: { decrement: i.quantity } }
               });
           }

           // 3. Inject Ledger Income Record automatically
           await tx.ledgerEntry.create({
              data: {
                  type: "INCOME",
                  amount: finalAmount,
                  description: `POS Retail Sale [${invoiceNumber}]`,
                  transactionId: sale.id
              }
           });

           // 4. Update Loyalty points if customer exists
           if (customerId) {
               const pointsEarned = Math.floor(finalAmount / 100); // 1 point per 100 spent
               await tx.customer.update({
                   where: { id: customerId },
                   data: { loyaltyPoints: { increment: pointsEarned } }
               });
           }
       });

       // 5. Mock trigger for external SMS Sri Lanka Gateway
       if (customerPhone) {
           console.log(`[HTTP SMS Gateway via Notify.lk / Dialog] Dispatching SMS to ${customerPhone} for Inv: ${invoiceNumber} totaling Rs. ${finalAmount}`);
       }

       revalidatePath("/admin/sales");
       revalidatePath("/admin/products");
       revalidatePath("/admin/ledger");

       return { success: true, invoiceNumber };
   } catch (error) {
       console.error("POS Checkout Failure:", error);
       return { success: false, msg: "Financial Transaction Error - Checkout Aborted" };
   }
}
