import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { addTrip, getTrips, updateTrip, deleteTrip, deleteAllTrips } from "@/utils/db/trip";
import { addTripExpense, getTripExpenses, deleteTripExpense } from "@/utils/db/trip";
import { tripCreateBodySchema, tripUpdateBodySchema, tripExpenseBodySchema } from "@/app/api/dashboard/_schemas";

/* =========================
   GET TRIPS
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

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    if (!userId && !tripId) {
      return NextResponse.json(
        { success: false, message: "Missing userId or tripId" },
        { status: 400 }
      );
    }

    // Get single trip's expenses
    if (tripId) {
      const result = await getTripExpenses(tripId);
      return NextResponse.json(result);
    }

    // Get all trips for user
    const result = await getTrips(userId!);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE TRIP
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

    const parsed = tripCreateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, destination, startDate, endDate, budget, status } = parsed.data;

    const result = await addTrip({
      userId,
      name,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      status: status || "upcoming",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Create trip error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE TRIP / ADD EXPENSE
========================= */
export async function PUT(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Add expense to trip
    if (type === "expense") {
      const parsed = tripExpenseBodySchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { tripId, description, amount, category, date } = parsed.data;

      const result = await addTripExpense({
        tripId,
        description,
        amount,
        category,
        date: date ? new Date(date) : new Date(),
      });

      return NextResponse.json(result);
    }

    // Update trip
    const parsed = tripUpdateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, name, destination, startDate, endDate, budget, status } = parsed.data;

    const result = await updateTrip({
      id,
      name,
      destination,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update/Add expense error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE TRIP / EXPENSE
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

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");
    const expenseId = searchParams.get("expenseId");
    const deleteAll = searchParams.get("userId");

    // Delete expense
    if (expenseId) {
      const result = await deleteTripExpense(expenseId);
      return NextResponse.json(result);
    }

    // Delete all trips for user
    if (deleteAll) {
      const result = await deleteAllTrips(userId);
      return NextResponse.json(result);
    }

    // Delete single trip
    if (!tripId) {
      return NextResponse.json(
        { success: false, message: "Missing tripId" },
        { status: 400 }
      );
    }

    const result = await deleteTrip(tripId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}