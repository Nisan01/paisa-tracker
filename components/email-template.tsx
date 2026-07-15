import * as React from "react";

interface LoanDueReminderEmailProps {
  userName: string;
  personName: string;
  loanType: "lent" | "borrowed";
  remainingAmount: string;
  dueDate: string;
  daysLabel: string;
}

export function LoanDueReminderEmail({
  userName,
  personName,
  loanType,
  remainingAmount,
  dueDate,
  daysLabel,
}: LoanDueReminderEmailProps) {
  const actionText =
    loanType === "borrowed"
      ? `You borrowed money from ${personName}.`
      : `You lent money to ${personName}.`;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0f0f10",
        color: "#f4f4f5",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "28px",
          backgroundColor: "rgba(255,255,255,0.04)",
        }}
      >
        <p style={{ color: "#facc15", fontSize: "13px", margin: "0 0 12px" }}>
          PaisaTracker Reminder
        </p>
        <h1 style={{ fontSize: "24px", margin: "0 0 16px" }}>
          Loan due {daysLabel}
        </h1>
        <p style={{ lineHeight: 1.6, color: "#d4d4d8" }}>Hi {userName},</p>
        <p style={{ lineHeight: 1.6, color: "#d4d4d8" }}>
          {actionText} The remaining amount is <strong>Rs {remainingAmount}</strong>,
          and the due date is <strong>{dueDate}</strong>.
        </p>
        <p style={{ lineHeight: 1.6, color: "#a1a1aa" }}>
          Open your dashboard to review the loan and update its status if it has
          already been settled.
        </p>
      </div>
    </div>
  );
}
