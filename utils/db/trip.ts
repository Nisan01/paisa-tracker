import { getDb } from "@/index";
import { trips, tripExpenses } from "./schema";
import { eq, desc, inArray } from "drizzle-orm";

export const addTrip = async (tripData: {
  userId: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status?: "upcoming" | "active" | "completed";
}) => {
  try {
    const db = getDb();

    const [newTrip] = await db
      .insert(trips)
      .values({
        userId: tripData.userId,
        name: tripData.name,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        budget: tripData.budget.toString(),
        status: tripData.status || "upcoming",
      })
      .returning();

    return {
      success: true,
      message: "Trip created successfully",
      trip: newTrip,
    };
  } catch (error) {
    console.error("addTrip error:", error);
    return {
      success: false,
      message: "Failed to create trip",
    };
  }
};

export const getTrips = async (userId: string) => {
  try {
    const db = getDb();

    const userTrips = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt));

    return {
      success: true,
      trips: userTrips,
    };
  } catch (error) {
    console.error("getTrips error:", error);
    return {
      success: false,
      message: "Failed to fetch trips",
      trips: [],
    };
  }
};

export const updateTrip = async (tripData: {
  id: string;
  name?: string;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status?: "upcoming" | "active" | "completed";
}) => {
  try {
    const db = getDb();

    const updateData: any = {};
    if (tripData.name) updateData.name = tripData.name;
    if (tripData.destination) updateData.destination = tripData.destination;
    if (tripData.startDate) updateData.startDate = tripData.startDate;
    if (tripData.endDate) updateData.endDate = tripData.endDate;
    if (tripData.budget) updateData.budget = tripData.budget.toString();
    if (tripData.status) updateData.status = tripData.status;

    await db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, tripData.id));

    return {
      success: true,
      message: "Trip updated successfully",
    };
  } catch (error) {
    console.error("updateTrip error:", error);
    return {
      success: false,
      message: "Failed to update trip",
    };
  }
};

export const deleteTrip = async (tripId: string) => {
  try {
    const db = getDb();

    await db
      .delete(trips)
      .where(eq(trips.id, tripId));

    return {
      success: true,
      message: "Trip deleted successfully",
    };
  } catch (error) {
    console.error("deleteTrip error:", error);
    return {
      success: false,
      message: "Failed to delete trip",
    };
  }
};

export const deleteAllTrips = async (userId: string) => {
  try {
    const db = getDb();

    await db
      .delete(trips)
      .where(eq(trips.userId, userId));

    return {
      success: true,
      message: "All trips deleted successfully",
    };
  } catch (error) {
    console.error("deleteAllTrips error:", error);
    return {
      success: false,
      message: "Failed to delete trips",
    };
  }
};

// Trip Expenses
export const addTripExpense = async (expenseData: {
  tripId: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}) => {
  try {
    const db = getDb();

    const [newExpense] = await db
      .insert(tripExpenses)
      .values({
        tripId: expenseData.tripId,
        description: expenseData.description,
        amount: expenseData.amount.toString(),
        category: expenseData.category,
        date: expenseData.date,
      })
      .returning();

    return {
      success: true,
      message: "Expense added successfully",
      expense: newExpense,
    };
  } catch (error) {
    console.error("addTripExpense error:", error);
    return {
      success: false,
      message: "Failed to add expense",
    };
  }
};

export const getTripExpenses = async (tripId: string) => {
  try {
    const db = getDb();

    const tripExpenseList = await db
      .select()
      .from(tripExpenses)
      .where(eq(tripExpenses.tripId, tripId))
      .orderBy(desc(tripExpenses.date));

    return {
      success: true,
      expenses: tripExpenseList,
    };
  } catch (error) {
    console.error("getTripExpenses error:", error);
    return {
      success: false,
      message: "Failed to fetch expenses",
      expenses: [],
    };
  }
};

export const getAllTripExpenses = async (userId: string) => {
  try {
    const db = getDb();

    // Get all trips for user first
    const userTrips = await db
      .select({ id: trips.id })
      .from(trips)
      .where(eq(trips.userId, userId));

    const tripIds = userTrips.map((t) => t.id);

    if (tripIds.length === 0) {
      return { success: true, expenses: [] };
    }

    // Get all expenses for those trips
    const allExpenses = await db
      .select()
      .from(tripExpenses)
      .where(inArray(tripExpenses.tripId, tripIds))
      .orderBy(desc(tripExpenses.date));

    return {
      success: true,
      expenses: allExpenses,
    };
  } catch (error) {
    console.error("getAllTripExpenses error:", error);
    return {
      success: false,
      message: "Failed to fetch expenses",
      expenses: [],
    };
  }
};

export const deleteTripExpense = async (expenseId: string) => {
  try {
    const db = getDb();

    await db
      .delete(tripExpenses)
      .where(eq(tripExpenses.id, expenseId));

    return {
      success: true,
      message: "Expense deleted successfully",
    };
  } catch (error) {
    console.error("deleteTripExpense error:", error);
    return {
      success: false,
      message: "Failed to delete expense",
    };
  }
};

export const getTripSpent = async (tripId: string): Promise<number> => {
  try {
    const db = getDb();

    const expenses = await db
      .select({ amount: tripExpenses.amount })
      .from(tripExpenses)
      .where(eq(tripExpenses.tripId, tripId));

    return expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  } catch (error) {
    console.error("getTripSpent error:", error);
    return 0;
  }
};