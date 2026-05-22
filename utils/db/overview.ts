import { accounts, transactions, budgets,loans } from "./schema";
import { getDb } from "@/index";
import { eq ,and,desc} from "drizzle-orm";

export const overview = async (currentUserId: string) => {
  try {
    const db = await getDb();

    // ======================
    // ACCOUNTS → TOTAL BALANCE
    // ======================
    const accountsData = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, currentUserId));

    const totalBalance = accountsData.reduce(
      (sum, a) => sum + Number(a.balance),
      0
    );

    // ======================
    // TRANSACTIONS
    // ======================
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, currentUserId));

    const totalIncome = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // ======================
    // MONTHS
    // ======================
    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthTxns = allTransactions.filter(
      (t) => new Date(t.date) >= startOfCurrentMonth
    );

    const prevMonthTxns = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return d >= startOfPrevMonth && d <= endOfPrevMonth;
    });

    const calcNet = (txns: typeof allTransactions) =>
      txns.reduce((sum, t) => {
        const amt = Number(t.amount);
        return t.type === "income" ? sum + amt : sum - amt;
      }, 0);

    const currentMonthNet = calcNet(currentMonthTxns);
    const prevMonthNet = calcNet(prevMonthTxns);

    const balanceChangeRate =
      prevMonthNet === 0
        ? 0
        : ((currentMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100;

    // ======================
    // RECENT TRANSACTIONS
    // ======================
    const transactionsData = allTransactions
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() -
          new Date(a.createdAt!).getTime()
      )
      ;


    // ======================
    // ALL TRANSACTIONS (for budget spent calculation)
    // ======================
    const allTransactionsData = allTransactions;

    // ======================
    // BUDGETS
    // ======================
    const budgetsData = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, currentUserId))
      .orderBy(desc(budgets.createdAt));




const loanLentData = await db
  .select()
  .from(loans)
  .where(
    and(
      eq(loans.userId, currentUserId),
      eq(loans.type, "lent")
    )
  ).orderBy(desc(loans.createdAt))
  .limit(5);

const loanBorrowedData = await db
  .select()
  .from(loans)
  .where(
    and(
      eq(loans.userId, currentUserId),
      eq(loans.type, "borrowed")
    )
  )
  .orderBy(desc(loans.createdAt))
  .limit(5);

  const loanData=[...loanLentData,...loanBorrowedData]


    // ======================
    // RETURN
    // ======================
    return {
      message: "Overview data fetched successfully",

      totalBalance,
      totalIncome,
      totalExpenses,

      accountsData,
      transactionsData,
      allTransactionsData,
      budgetsData,

      currentMonthNet,
      prevMonthNet,
      balanceChangeRate,
       loanData
    };
  } catch (error) {
    return {
      message: "Error fetching overview data",
    };
  }
};