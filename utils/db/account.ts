import { getDb } from "@/index";
import { accounts, transactions } from "./schema";
import { eq } from "drizzle-orm";

export const addAccount = async (accountData: {
  userId: string;
  name: string;
  type: string;
  balance?: string; 
  isDefault?: boolean;
}) => {
  try {
    const db = getDb();
    if (accountData.isDefault) {
  await db
    .update(accounts)
    .set({ isDefault: false })
    .where(eq(accounts.userId, accountData.userId));
}

    const [newAccount] = await db
      .insert(accounts)
      .values({
        userId: accountData.userId,
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance ?? "0",
        isDefault: accountData.isDefault ?? false,
      })
      .returning();

    return {
      success: true,
      message: "Account added successfully",
      account: newAccount,
    };
  } catch (error) {
    console.error("addAccount error:", error);

    return {
      success: false,
      message: "Failed to add account",
    };
  }
};



export const getAccounts = async (userId: string) => {
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
    console.error("getAccounts error:", error);

    return {
      success: false,
      message: "Failed to fetch accounts",
      accounts: [],
    };
  }
};

export const deleteAllAccounts = async (userId: string) => {
  try {
    const db = getDb();

    await db
      .delete(transactions)
      .where(eq(transactions.userId, userId));

    await db
      .delete(accounts)
      .where(eq(accounts.userId, userId));

    return {
      success: true,
      message: "All accounts deleted successfully",
    };
  } catch (error) {
    console.error("deleteAllAccounts error:", error);

    return {
      success: false,
      message: "Failed to delete accounts",
    };
  }
};

export const deleteAccount = async (userId: string, accountId: string) => {
  try {
    const db = getDb();

    await db
      .delete(transactions)
      .where(eq(transactions.accountId, accountId));

    await db
      .delete(accounts)
      .where(eq(accounts.userId, userId))
      .where(eq(accounts.id, accountId));

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error("deleteAccount error:", error);

    return {
      success: false,
      message: "Failed to delete account",
    };
  }
};