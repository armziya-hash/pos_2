"use server"
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();
export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const storeId = formData.get("storeId") as string;
  if (!name) return;
  await prisma.category.create({ data: { name, storeId: storeId || null } });
  revalidatePath("/admin/categories");
}
