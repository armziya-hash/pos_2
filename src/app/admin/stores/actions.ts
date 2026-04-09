"use server"
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
const prisma = new PrismaClient();

export async function createStore(formData: FormData) {
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const currencySymbol = formData.get("currencySymbol") as string || "LKR";
  if (!name || !location) return;
  await prisma.store.create({ data: { name, location, currencySymbol } });
  revalidatePath("/admin/stores");
}
