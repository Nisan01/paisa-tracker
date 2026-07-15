import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { addLoan, getLoans, updateLoan, deleteLoan, deleteAllLoans } from "@/utils/db/loan";
import { addLoanPayment } from "@/utils/db/loan";
import { loanBodySchema, loanPaymentBodySchema } from "@/app/api/dashboard/_schemas";

/* =========================
   GET LOANS
========================= */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const nearDueDays = searchParams.get("nearDueDays");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await getLoans(userId, nearDueDays ? parseInt(nearDueDays) : undefined);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch loans" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE LOAN
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

    const parsed = loanBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { personName, phone, type, totalAmount, remainingAmount, dueDate, status, notes } = parsed.data;

    const result = await addLoan({
      userId,
      personName,
      phone,
      type,
      totalAmount,
      remainingAmount: remainingAmount ?? totalAmount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: status || "active",
      notes,
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
   UPDATE LOAN
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
    const loanId = searchParams.get("id");

    if (!loanId) {
      return NextResponse.json(
        { success: false, message: "Missing loanId" },
        { status: 400 }
      );
    }

    const parsed = loanBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { personName, phone, type, totalAmount, remainingAmount, dueDate, status, notes } = parsed.data;

    const result = await updateLoan({
      id: loanId,
      personName,
      phone,
      type,
      totalAmount,
      remainingAmount: remainingAmount === undefined ? undefined : remainingAmount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: status || "active",
      notes,
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
   DELETE LOAN(S)
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
    const loanId = searchParams.get("id");
    const deleteAll = searchParams.get("userId");

    // Delete all loans for user
    if (deleteAll) {
      const result = await deleteAllLoans(userId);
      return NextResponse.json(result);
    }

    // Delete single loan
    if (!loanId) {
      return NextResponse.json(
        { success: false, message: "Missing loanId or userId" },
        { status: 400 }
      );
    }

    const result = await deleteLoan(loanId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   RECORD LOAN PAYMENT
========================= */
export async function PATCH(req: Request) {
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
    const parsed = loanPaymentBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { loanId, amount } = parsed.data;

    const result = await addLoanPayment(loanId, amount);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
