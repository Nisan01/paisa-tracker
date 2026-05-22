import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { addLoanPayment } from "@/utils/db/loan";
import { loanPaymentBodySchema } from "@/app/api/dashboard/_schemas";

/* =========================
   RECORD LOAN PAYMENT
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
    console.error("addLoanPayment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}