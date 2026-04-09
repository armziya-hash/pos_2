"use server"

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createManualJournal(formData: FormData) {
  const type = formData.get("type") as string; // DEBIT_NOTE or CREDIT_NOTE
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;

  if (isNaN(amount) || amount <= 0 || !description) return;

  try {
    await prisma.ledgerEntry.create({
        data: { 
            type, 
            amount, 
            description 
        }
    });
    revalidatePath("/admin/ledger");
  } catch (error) {
    console.error("Ledger constraint:", error);
  }
}
