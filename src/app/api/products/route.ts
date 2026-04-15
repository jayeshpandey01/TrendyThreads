import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Sort = "newest" | "price_asc" | "price_desc";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const category = (searchParams.get("category") ?? "").trim();
    const sort = (searchParams.get("sort") ?? "newest").trim() as Sort;

    const where =
      q || category
        ? {
            AND: [
              category
                ? {
                    category: { equals: category, mode: "insensitive" as const },
                  }
                : {},
              q
                ? {
                    OR: [
                      { name: { contains: q, mode: "insensitive" as const } },
                      { description: { contains: q, mode: "insensitive" as const } },
                      { category: { contains: q, mode: "insensitive" as const } },
                    ],
                  }
                : {},
            ],
          }
        : undefined;

    const orderBy =
      sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        stock: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

