import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/index";
import { users, accounts, transactions, budgets, loans } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

/* =========================
   DELETE USER AND ALL DATA
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

    const db = getDb();

    // Delete in order due to foreign key constraints
    // 1. Delete transactions first (no cascade on userId)
    await db
      .delete(transactions)
      .where(eq(transactions.userId, userId));

    // 2. Delete budgets (no cascade on userId)
    await db
      .delete(budgets)
      .where(eq(budgets.userId, userId));

    // 3. Delete loans (no cascade on userId)
    await db
      .delete(loans)
      .where(eq(loans.userId, userId));

    // 4. Delete accounts (has cascade, will auto-delete if we don't do it manually)
    await db
      .delete(accounts)
      .where(eq(accounts.userId, userId));

    // 5. Delete user last
    await db
      .delete(users)
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "User account and all data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}