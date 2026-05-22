import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { addBudget, getBudgets, deleteAllBudgets } from "@/utils/db/budget";
import { budgetBodySchema } from "@/app/api/dashboard/_schemas";

/* =========================
   GET BUDGETS
========================= */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await getBudgets(userId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE BUDGET
========================= */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const parsed = budgetBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { category, amount, period } = parsed.data;

    const result = await addBudget({
      userId,
      category,
      amount,
      period,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE ALL BUDGETS
========================= */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await deleteAllBudgets(userId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}