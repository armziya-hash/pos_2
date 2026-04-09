"use server"

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createSupplier(formData: FormData) {
  const name = formData.get("name") as string;
  const contact = formData.get("contact") as string;
  const address = formData.get("address") as string;

  if (!name) return;

  try {
    await prisma.supplier.create({
      data: { 
        name, 
        contact: contact || null,
        address: address || null
      }
    });
    revalidatePath("/admin/suppliers");
  } catch (error) {
    console.error("Error creating supplier:", error);
  }
}
