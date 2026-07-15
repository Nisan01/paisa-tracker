import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  numeric,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const budgetPeriodEnum = pgEnum("budget_period", [
  "monthly",
  "weekly",
]);

export const loanTypeEnum = pgEnum("loan_type", [
  "lent",
  "borrowed",
]);

export const loanStatusEnum = pgEnum("loan_status", [
  "active",
  "pending",
  "paid",
]);

export const loanReminderTypeEnum = pgEnum("loan_reminder_type", [
  "7_days",
  "3_days",
  "1_day",
  "due_today",
]);

export const reminderStatusEnum = pgEnum("reminder_status", [
  "sent",
  "failed",
]);

// ============================================================
// USERS
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name"),
  email: text("email").notNull().unique(),

  country: text("country").default("Nepal"),
  currencyCode: text("currency_code").default("NPR"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// ACCOUNTS
// ============================================================

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  name: text("name").notNull(),

  type: text("type").notNull(), 

  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),

  isDefault: boolean("is_default").default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// TRANSACTIONS
// ============================================================

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),

  type: transactionTypeEnum("type").notNull(),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  description: text("description"),

  category: text("category").notNull(), // FREE FORM CATEGORY

  budgetId: uuid("budget_id").references(() => budgets.id), // optional

  date: timestamp("date").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// BUDGETS
// ============================================================

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  category: text("category").notNull(),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  period: budgetPeriodEnum("period").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// LOANS
// ============================================================

export const loans = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  personName: text("person_name").notNull(),
  phone: text("phone"),
  type: loanTypeEnum("type").notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  remainingAmount: numeric("remaining_amount", { precision: 15, scale: 2 }).notNull(),
  

  notes: text("notes"), 
  
  dueDate: timestamp("due_date"),
  status: loanStatusEnum("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// TRIPS
// ============================================================

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: numeric("budget", { precision: 15, scale: 2 }).notNull(),
  status: text("status").default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// TRIP EXPENSES
// ============================================================

export const tripExpenses = pgTable("trip_expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// LOAN PAYMENTS
// ============================================================

export const loanPayments = pgTable("loan_payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  loanId: uuid("loan_id")
    .references(() => loans.id, { onDelete: "cascade" })
    .notNull(),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  paymentDate: timestamp("payment_date").notNull(),

  note: text("note"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ============================================================
// LOAN REMINDER LOGS
// ============================================================

export const loanReminderLogs = pgTable(
  "loan_reminder_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    loanId: uuid("loan_id")
      .references(() => loans.id, { onDelete: "cascade" })
      .notNull(),

    reminderType: loanReminderTypeEnum("reminder_type").notNull(),
    dueDateSnapshot: timestamp("due_date_snapshot", { withTimezone: true }).notNull(),
    status: reminderStatusEnum("status").notNull(),

    attemptCount: integer("attempt_count").notNull().default(1),
    resendEmailId: text("resend_email_id"),
    errorMessage: text("error_message"),

    attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow().notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueReminder: uniqueIndex("loan_reminder_logs_loan_type_due_unique").on(
      table.loanId,
      table.reminderType,
      table.dueDateSnapshot
    ),
  })
);

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  budgets: many(budgets),
  loans: many(loans),
  loanReminderLogs: many(loanReminderLogs),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  budget: one(budgets, {
    fields: [transactions.budgetId],
    references: [budgets.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  expenses: many(tripExpenses),
}));

export const tripExpensesRelations = relations(tripExpenses, ({ one }) => ({
  trip: one(trips, {
    fields: [tripExpenses.tripId],
    references: [trips.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  payments: many(loanPayments),
  reminderLogs: many(loanReminderLogs),
}));

export const loanPaymentsRelations = relations(loanPayments, ({ one }) => ({
  loan: one(loans, {
    fields: [loanPayments.loanId],
    references: [loans.id],
  }),
}));

export const loanReminderLogsRelations = relations(loanReminderLogs, ({ one }) => ({
  user: one(users, {
    fields: [loanReminderLogs.userId],
    references: [users.id],
  }),
  loan: one(loans, {
    fields: [loanReminderLogs.loanId],
    references: [loans.id],
  }),
}));
