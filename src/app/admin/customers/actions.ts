"use server"

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name) return;

  try {
    await prisma.customer.create({
      data: { 
        name, 
        phone: phone || null 
      }
    });
    revalidatePath("/admin/customers");
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}
