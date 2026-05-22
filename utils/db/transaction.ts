import { getDb } from "@/index";
import { transactions, accounts } from "./schema";
import { eq, desc, sql } from "drizzle-orm";

export const addTransaction = async (transactionData: {
  userId: string;
  accountId: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  category: string;
  date: Date;
}) => {
  try {
    const db = getDb();

    // neon-http driver does not support transactions; perform sequential writes.
    const [created] = await db
      .insert(transactions)
      .values({
        userId: transactionData.userId,
        accountId: transactionData.accountId,
        type: transactionData.type,
        amount: transactionData.amount.toString(),
        description: transactionData.description,
        category: transactionData.category,
        date: transactionData.date,
      })
      .returning();

    const delta =
      transactionData.type === "income"
        ? transactionData.amount
        : -transactionData.amount;

    await db
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + ${delta}` })
      .where(eq(accounts.id, transactionData.accountId));

    return {
      success: true,
      message: "Transaction added successfully",
      transaction: created,
    };
  } catch (error) {
    console.error("addTransaction error:", error);
    return {
      success: false,
      message: "Failed to add transaction",
    };
  }
};

export const getTransactions = async (userId: string) => {
  try {
    const db = getDb();

    const userTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        category: transactions.category,
        date: transactions.date,
        accountId: transactions.accountId,
        createdAt: transactions.createdAt,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    return {
      success: true,
      transactions: userTransactions,
    };
  } catch (error) {
    console.error("getTransactions error:", error);
    return {
      success: false,
      message: "Failed to fetch transactions",
      transactions: [],
    };
  }
};

export const getAccountsForUser = async (userId: string) => {
  try {
    const db = getDb();

    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    return {
      success: true,
      accounts: userAccounts,
    };
  } catch (error) {
    console.error("getAccountsForUser error:", error);
    return {
      success: false,
      accounts: [],
    };
  }
};

export const deleteAllTransactions = async (userId: string) => {
  try {
    const db = getDb();

    await db
      .delete(transactions)
      .where(eq(transactions.userId, userId));

    return {
      success: true,
      message: "All transactions deleted successfully",
    };
  } catch (error) {
    console.error("deleteAllTransactions error:", error);
    return {
      success: false,
      message: "Failed to delete transactions",
    };
  }
};