"use server"
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  let barcode = formData.get("barcode") as string;
  const categoryId = formData.get("categoryId") as string;
  const supplierId = formData.get("supplierId") as string;
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const stockQuantity = parseInt(formData.get("stockQuantity") as string);

  if (!name) return;
  if (!barcode) {
      // Auto generate a 12 digit barcode if empty
      barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  try {
    await prisma.product.create({
      data: {
        name,
        barcode,
        categoryId: categoryId || null,
        supplierId: supplierId || null,
        costPrice: isNaN(costPrice) ? 0 : costPrice,
        sellingPrice: isNaN(sellingPrice) ? 0 : sellingPrice,
        stockQuantity: isNaN(stockQuantity) ? 0 : stockQuantity
      }
    });
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("Product creation error", error);
  }
}

export async function batchImportProducts(parsedData: any[]) {
    if (!parsedData || parsedData.length === 0) return { success: false, msg: "No data" };
    
    try {
        const payload = parsedData.map((row: any) => ({
            name: row.name || "Unknown Product",
            barcode: row.barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
            costPrice: parseFloat(row.costPrice) || 0,
            sellingPrice: parseFloat(row.sellingPrice) || 0,
            stockQuantity: parseInt(row.stockQuantity) || 0,
        }));

        await prisma.product.createMany({
            data: payload,
            skipDuplicates: true
        });
        revalidatePath("/admin/products");
        return { success: true };
    } catch(e) {
        console.error(e);
        return { success: false, msg: "Database error during import" };
    }
}
