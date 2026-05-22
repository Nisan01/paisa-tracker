import { z } from "zod";

export const transactionBodySchema = z.object({
  accountId: z.string().min(1),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().finite().gt(0),
  description: z.string().optional(),
  category: z.string().min(1),
  date: z.string().optional(),
});

export const budgetBodySchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().finite().gt(0),
  period: z.enum(["monthly", "weekly"]),
});

export const accountBodySchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  balance: z.coerce.number().finite().nonnegative().optional(),
  isDefault: z.boolean().optional(),
});

export const loanBodySchema = z.object({
  personName: z.string().min(1),
  phone: z.string().optional(),
  type: z.enum(["lent", "borrowed"]),
  totalAmount: z.coerce.number().finite().gt(0),
  remainingAmount: z.coerce.number().finite().nonnegative().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["active", "pending", "paid"]).optional(),
  notes: z.string().optional(),
});

export const loanPaymentBodySchema = z.object({
  loanId: z.string().min(1),
  amount: z.coerce.number().finite().gt(0),
});

export const tripCreateBodySchema = z
  .object({
    name: z.string().min(1),
    destination: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    budget: z.coerce.number().finite().gt(0),
    status: z.enum(["upcoming", "active", "completed"]).optional(),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: "endDate must be after startDate", path: ["endDate"] }
  );

export const tripUpdateBodySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().optional(),
    destination: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z.coerce.number().finite().gt(0).optional(),
    status: z.enum(["upcoming", "active", "completed"]).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    { message: "endDate must be after startDate", path: ["endDate"] }
  );

export const tripExpenseBodySchema = z.object({
  tripId: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().finite().gt(0),
  category: z.string().min(1),
  date: z.string().optional(),
});

export const analysisBodySchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
});
