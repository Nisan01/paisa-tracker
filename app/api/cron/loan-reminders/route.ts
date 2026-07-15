import { LoanDueReminderEmail } from "@/components/email-template";
import { getDb } from "@/index";
import { loanReminderLogs, loans, users } from "@/utils/db/schema";
import { and, eq, isNotNull, or, sql } from "drizzle-orm";
import { Resend } from "resend";

type ReminderType = "7_days" | "3_days" | "1_day" | "due_today";
type ReminderStatus = "sent" | "failed";

const resend = new Resend(process.env.RESEND_API_KEY);

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getDaysRemaining(dueDate: Date) {
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  const diffMs = due.getTime() - today.getTime();

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getReminderType(daysRemaining: number): ReminderType | null {
  if (daysRemaining <= 0) return "due_today";
  if (daysRemaining <= 1) return "1_day";
  if (daysRemaining <= 3) return "3_days";
  if (daysRemaining <= 7) return "7_days";

  return null;
}

function getDaysLabel(daysRemaining: number) {
  if (daysRemaining < 0) return "now";
  if (daysRemaining === 0) return "today";
  if (daysRemaining === 1) return "in 1 day";

  return `in ${daysRemaining} days`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

async function upsertReminderLog({
  existingLogId,
  userId,
  loanId,
  reminderType,
  dueDateSnapshot,
  status,
  resendEmailId,
  errorMessage,
}: {
  existingLogId?: string;
  userId: string;
  loanId: string;
  reminderType: ReminderType;
  dueDateSnapshot: Date;
  status: ReminderStatus;
  resendEmailId?: string | null;
  errorMessage?: string | null;
}) {
  const db = getDb();
  const now = new Date();
  const values = {
    status,
    resendEmailId: resendEmailId ?? null,
    errorMessage: errorMessage ?? null,
    attemptedAt: now,
    sentAt: status === "sent" ? now : null,
    updatedAt: now,
  };

  if (existingLogId) {
    await db
      .update(loanReminderLogs)
      .set({
        ...values,
        attemptCount: sql`${loanReminderLogs.attemptCount} + 1`,
      })
      .where(eq(loanReminderLogs.id, existingLogId));

    return;
  }

  await db.insert(loanReminderLogs).values({
    userId,
    loanId,
    reminderType,
    dueDateSnapshot,
    ...values,
  });
}

async function handleLoanReminders(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { success: false, message: "RESEND_API_KEY is missing" },
      { status: 500 }
    );
  }

  const db = getDb();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "PaisaTracker <nishanchauhan2025@gmail.com>";

  const dueLoans = await db
    .select({
      loanId: loans.id,
      userId: loans.userId,
      personName: loans.personName,
      loanType: loans.type,
      remainingAmount: loans.remainingAmount,
      dueDate: loans.dueDate,
      userName: users.name,
      userEmail: users.email,
    })
    .from(loans)
    .innerJoin(users, eq(loans.userId, users.id))
    .where(
      and(
        isNotNull(loans.dueDate),
        or(eq(loans.status, "active"), eq(loans.status, "pending")),
        sql`${loans.remainingAmount}::numeric > 0`
      )
    );

  const summary = {
    checked: dueLoans.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: [] as Array<{
      loanId: string;
      reminderType?: ReminderType;
      status: "sent" | "failed" | "skipped";
      reason?: string;
    }>,
  };

  for (const loan of dueLoans) {
    if (!loan.dueDate) {
      summary.skipped += 1;
      summary.details.push({
        loanId: loan.loanId,
        status: "skipped",
        reason: "Missing due date",
      });
      continue;
    }

    const daysRemaining = getDaysRemaining(loan.dueDate);
    const reminderType = getReminderType(daysRemaining);

    if (!reminderType) {
      summary.skipped += 1;
      summary.details.push({
        loanId: loan.loanId,
        status: "skipped",
        reason: "Due date is outside reminder window",
      });
      continue;
    }

    const [existingLog] = await db
      .select()
      .from(loanReminderLogs)
      .where(
        and(
          eq(loanReminderLogs.loanId, loan.loanId),
          eq(loanReminderLogs.reminderType, reminderType),
          eq(loanReminderLogs.dueDateSnapshot, loan.dueDate)
        )
      )
      .limit(1);

    if (existingLog?.status === "sent") {
      summary.skipped += 1;
      summary.details.push({
        loanId: loan.loanId,
        reminderType,
        status: "skipped",
        reason: "Reminder already sent",
      });
      continue;
    }

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: [loan.userEmail],
        subject: `Loan due ${getDaysLabel(daysRemaining)}`,
        react: LoanDueReminderEmail({
          userName: loan.userName || "there",
          personName: loan.personName,
          loanType: loan.loanType,
          remainingAmount: Number(loan.remainingAmount).toLocaleString(),
          dueDate: formatDate(loan.dueDate),
          daysLabel: getDaysLabel(daysRemaining),
        }),
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      await upsertReminderLog({
        existingLogId: existingLog?.id,
        userId: loan.userId,
        loanId: loan.loanId,
        reminderType,
        dueDateSnapshot: loan.dueDate,
        status: "sent",
        resendEmailId: result.data?.id,
      });

      summary.sent += 1;
      summary.details.push({
        loanId: loan.loanId,
        reminderType,
        status: "sent",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown email send error";

      await upsertReminderLog({
        existingLogId: existingLog?.id,
        userId: loan.userId,
        loanId: loan.loanId,
        reminderType,
        dueDateSnapshot: loan.dueDate,
        status: "failed",
        errorMessage,
      });

      summary.failed += 1;
      summary.details.push({
        loanId: loan.loanId,
        reminderType,
        status: "failed",
        reason: errorMessage,
      });
    }
  }

  return Response.json({
    success: true,
    ...summary,
  });
}

export async function GET(req: Request) {
  return handleLoanReminders(req);
}

export async function POST(req: Request) {
  return handleLoanReminders(req);
}
