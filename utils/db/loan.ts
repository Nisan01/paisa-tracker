import { getDb } from "@/index";
import { loans } from "./schema";
import { eq, desc, and, isNotNull, sql, or } from "drizzle-orm";

export const addLoan = async (loanData: {
  userId: string;
  personName: string;
  phone?: string;
  type: "lent" | "borrowed";
  totalAmount: number;
  remainingAmount: number;
  dueDate?: Date;
  status?: "active" | "pending" | "paid";
  notes?: string;
}) => {
  try {
    const db = getDb();

    const [newLoan] = await db
      .insert(loans)
      .values({
        userId: loanData.userId,
        personName: loanData.personName,
        phone: loanData.phone || null,
        type: loanData.type,
        totalAmount: loanData.totalAmount.toString(),
        remainingAmount: loanData.remainingAmount.toString(),
        dueDate: loanData.dueDate || null,
        status: loanData.status || "active",
        notes: loanData.notes || null,
      })
      .returning();

    return {
      success: true,
      message: "Loan added successfully",
      loan: newLoan,
    };
  } catch (error) {
    console.error("addLoan error:", error);
    return {
      success: false,
      message: "Failed to add loan",
    };
  }
};

export const getLoans = async (userId: string, nearDueDays?: number) => {
  try {
    const db = getDb();

    let conditions = [eq(loans.userId, userId)];

    // If nearDueDays is provided, filter for loans due within that many days
    if (nearDueDays) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + nearDueDays);
      futureDate.setHours(23, 59, 59, 999);

      // Use SQL fragment for proper date comparison - include active and pending
      conditions.push(
        and(
          isNotNull(loans.dueDate),
          or(eq(loans.status, "active"), eq(loans.status, "pending")),
          sql`${loans.dueDate} <= ${futureDate.toISOString()}`
        )
      );
    }

    const userLoans = await db
      .select()
      .from(loans)
      .where(and(...conditions))
      .orderBy(desc(loans.createdAt));

    return {
      success: true,
      loans: userLoans,
    };
  } catch (error) {
    console.error("getLoans error:", error);
    return {
      success: false,
      message: "Failed to fetch loans",
      loans: [],
    };
  }
};

export const updateLoanStatus = async (loanId: string, status: "active" | "pending" | "paid") => {
  try {
    const db = getDb();

    await db
      .update(loans)
      .set({ status })
      .where(eq(loans.id, loanId));

    return {
      success: true,
      message: "Loan status updated",
    };
  } catch (error) {
    console.error("updateLoanStatus error:", error);
    return {
      success: false,
      message: "Failed to update loan status",
    };
  }
};

export const addLoanPayment = async (loanId: string, amount: number, note?: string, paymentDate?: Date) => {
  try {
    const db = getDb();

    // Get current loan
    const loan = await db
      .select()
      .from(loans)
      .where(eq(loans.id, loanId));

    if (!loan.length) {
      return { success: false, message: "Loan not found" };
    }

    const currentRemaining = parseFloat(loan[0].remainingAmount);
    const newRemaining = Math.max(0, currentRemaining - amount);
    const newStatus = newRemaining === 0 ? "paid" : loan[0].status;

    // Add payment record would go to loanPayments table
    // For now, just update remaining amount and status
    await db
      .update(loans)
      .set({
        remainingAmount: newRemaining.toString(),
        status: newStatus,
      })
      .where(eq(loans.id, loanId));

    return {
      success: true,
      message: "Payment recorded successfully",
    };
  } catch (error) {
    console.error("addLoanPayment error:", error);
    return {
      success: false,
      message: "Failed to record payment",
    };
  }
};

export const updateLoan = async (loanData: {
  id: string;
  personName: string;
  phone?: string;
  type: "lent" | "borrowed";
  totalAmount: number;
  remainingAmount?: number;
  dueDate?: Date;
  status: "active" | "pending" | "paid";
  notes?: string;
}) => {
  try {
    const db = getDb();

    const updateData: Record<string, any> = {
      personName: loanData.personName,
      phone: loanData.phone || null,
      type: loanData.type,
      totalAmount: loanData.totalAmount.toString(),
      dueDate: loanData.dueDate || null,
      status: loanData.status,
      notes: loanData.notes || null,
    };

    if (loanData.remainingAmount !== undefined) {
      updateData.remainingAmount = loanData.remainingAmount.toString();
    }

    await db
      .update(loans)
      .set(updateData)
      .where(eq(loans.id, loanData.id));

    return {
      success: true,
      message: "Loan updated successfully",
    };
  } catch (error) {
    console.error("updateLoan error:", error);
    return {
      success: false,
      message: "Failed to update loan",
    };
  }
};

export const deleteLoan = async (loanId: string) => {
  try {
    const db = getDb();

    await db
      .delete(loans)
      .where(eq(loans.id, loanId));

    return {
      success: true,
      message: "Loan deleted successfully",
    };
  } catch (error) {
    console.error("deleteLoan error:", error);
    return {
      success: false,
      message: "Failed to delete loan",
    };
  }
};

export const deleteAllLoans = async (userId: string) => {
  try {
    const db = getDb();

    await db
      .delete(loans)
      .where(eq(loans.userId, userId));

    return {
      success: true,
      message: "All loans deleted successfully",
    };
  } catch (error) {
    console.error("deleteAllLoans error:", error);
    return {
      success: false,
      message: "Failed to delete loans",
    };
  }
};