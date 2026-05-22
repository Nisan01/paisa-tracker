import { getDb } from "@/index";
import { budgets, transactions } from "./schema";
import { eq, desc } from "drizzle-orm";

export const addBudget = async (budgetData: {
  userId: string;
  category: string;
  amount: number;
  period: "monthly" | "weekly";
}) => {
  try {
    const db = getDb();

    const [newBudget] = await db
      .insert(budgets)
      .values({
        userId: budgetData.userId,
        category: budgetData.category,
        amount: budgetData.amount.toString(),
        period: budgetData.period,
      })
      .returning();

    return {
      success: true,
      message: "Budget added successfully",
      budget: newBudget,
    };
  } catch (error) {
    console.error("addBudget error:", error);
    return {
      success: false,
      message: "Failed to add budget",
    };
  }
};

export const getBudgets = async (userId: string) => {
  try {
    const db = getDb();

    const userBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.createdAt));

    return {
      success: true,
      budgets: userBudgets,
    };
  } catch (error) {
    console.error("getBudgets error:", error);
    return {
      success: false,
      message: "Failed to fetch budgets",
      budgets: [],
    };
  }
};

export const getSpentByCategory = async (userId: string, category: string, period: "monthly" | "weekly") => {
  try {
    const db = getDb();

    const now = new Date();
    let startDate: Date;

    if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
    }

    const categoryTransactions = await db
      .select()
      .from(transactions)
      .where(
        eq(transactions.userId, userId)
      );

    const filteredTransactions = categoryTransactions.filter(t => {
      const txDate = new Date(t.date);
      return t.category.toLowerCase() === category.toLowerCase() && txDate >= startDate;
    });

    const spent = filteredTransactions.reduce((acc, t) => {
      const amount = parseFloat(t.amount);
      return t.type === "expense" ? acc + Math.abs(amount) : acc;
    }, 0);

    return spent;
  } catch (error) {
    console.error("getSpentByCategory error:", error);
    return 0;
  }
};

export const updateBudget = async (budgetId: string, amount: number, category: string, period: "monthly" | "weekly") => {
  try {
    const db = getDb();

    await db
      .update(budgets)
      .set({ amount: amount.toString(), category, period })
      .where(eq(budgets.id, budgetId));

    return {
      success: true,
      message: "Budget updated successfully",
    };
  } catch (error) {
    console.error("updateBudget error:", error);
    return {
      success: false,
      message: "Failed to update budget",
    };
  }
};

export const deleteBudget = async (budgetId: string) => {
  try {
    const db = getDb();

    await db
      .delete(budgets)
      .where(eq(budgets.id, budgetId));

    return {
      success: true,
      message: "Budget deleted successfully",
    };
  } catch (error) {
    console.error("deleteBudget error:", error);
    return {
      success: false,
      message: "Failed to delete budget",
    };
  }
};

export const deleteAllBudgets = async (userId: string) => {
  try {
    const db = getDb();

    await db
      .delete(budgets)
      .where(eq(budgets.userId, userId));

    return {
      success: true,
      message: "All budgets deleted successfully",
    };
  } catch (error) {
    console.error("deleteAllBudgets error:", error);
    return {
      success: false,
      message: "Failed to delete budgets",
    };
  }
};