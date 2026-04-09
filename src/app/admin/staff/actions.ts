"use server"

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createStaff(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string || "CASHIER";

  if (!name || !email || !password) return;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });
    revalidatePath("/admin/staff");
  } catch (error) {
    console.error("Failed creating staff:", error);
  }
}

export async function toggleStaffStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
  await prisma.user.update({
      where: { id },
      data: { status: newStatus }
  });
  
  // Strict log out enforcement if disabled
  if (newStatus === "DISABLED") {
      await prisma.user.update({
          where: { id },
          data: { activeSessionId: null }
      });
  }
  revalidatePath("/admin/staff");
}
