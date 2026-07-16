"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Wallet,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { TransactionsPdf } from "@/components/dashboard/sections/transactions-pdf";
import { useMediaQuery } from "usehooks-ts";


interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  account: string;
  accountId?: string;
  date: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
}

type RawTransaction = {
  id: string;
  description?: string | null;
  amount?: string | number | null;
  type: "income" | "expense";
  category: string;
  accountName?: string | null;
  accountId?: string;
  date?: string | Date | null;
};

type TransactionsResponse = {
  success?: boolean;
  message?: string;
  transactions?: RawTransaction[];
};

type CreateTransactionPayload = {
  userId: string;
  accountId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
};

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other Income",
];

const expenseCategories = [
  "Food",
  "Bills",
  "Rent",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Other Expense",
];

export function TransactionsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<
    "all" | "income" | "expense"
  >("all");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newTxDescription, setNewTxDescription] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxType, setNewTxType] = useState<"income" | "expense">(
    "expense"
  );
  const [newTxCategory, setNewTxCategory] = useState("Food");
  const [newTxAccountId, setNewTxAccountId] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: session } = useSession();

  const queryClient = useQueryClient();
  const is1292 = useMediaQuery("(min-width: 1292px)");
const is1520 = useMediaQuery("(min-width: 1520px)");

const visibleCategories = is1520 ? 11 : 9;
  
  const fetchTransactions = async () => {
    const res = await fetch(
      `/api/dashboard/transaction?userId=${session?.user?.id}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const data = (await res.json()) as TransactionsResponse;

    if (!data?.success) {
      throw new Error(data?.message || "Failed to fetch transactions");
    }

    return (data.transactions || []).map((t) => ({
      id: t.id,
      description: t.description || "",
      amount: Number(t.amount || 0),
      type: t.type,
      category: t.category,
      account: t.accountName || "Unknown",
      accountId: t.accountId,
      date: t.date
        ? new Date(t.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    }));
  };

  // =========================
  // FETCH ACCOUNTS
  // =========================

  const fetchAccounts = async () => {
    const res = await fetch(
      `/api/dashboard/account?userId=${session?.user?.id}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch accounts");
    }

    return res.json();
  };

  // =========================
  // TRANSACTION QUERY
  // =========================

  const {
    data: txList = [],
    isLoading: loading,
    error: txError,
  } = useQuery({
    queryKey: ["transactions", session?.user?.id],
    queryFn: fetchTransactions,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });


  
  // =========================
  // ACCOUNT QUERY
  // =========================

  const { data: accountsData } = useQuery<{ accounts?: Account[] }>({
    queryKey: ["accounts", session?.user?.id],
    queryFn: fetchAccounts,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const accountList = accountsData?.accounts ?? [];
  const selectedNewTxAccountId = newTxAccountId || accountList[0]?.id || "";

  // =========================
  // CREATE TRANSACTION
  // =========================

  const createTransaction = async (payload: CreateTransactionPayload) => {
    const res = await fetch("/api/dashboard/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(
        errorBody?.message || "Failed to create transaction"
      );
    }

    const data = await res.json();

    if (!data?.success) {
      throw new Error(data?.message || "Failed to create transaction");
    }

    return data;
  };

  const mutation = useMutation({
    mutationFn: createTransaction,

    onSuccess: () => {
      toast.success("Transaction added successfully!",{
        position:"bottom-right"
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", session?.user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts", session?.user?.id],
      });

      setIsAddDialogOpen(false);

      setNewTxDescription("");
      setNewTxAmount("");
      setNewTxType("expense");
      setNewTxCategory("Food");
    },

    onError: () => {
      toast.error("Failed to add transaction");
    },
  });

  // =========================
  // HANDLE ADD
  // =========================

const handleAddTransaction = () => {
  if (!session?.user?.id) {
    toast.error("User not loaded yet");
    return;
  }

  if (!newTxDescription || !newTxAmount || !selectedNewTxAccountId) return;

  mutation.mutate({
    userId: session.user.id, // guaranteed
    accountId: selectedNewTxAccountId,
    type: newTxType,
    amount: parseFloat(newTxAmount),
    description: newTxDescription,
    category: newTxCategory,
    date: new Date().toISOString(),
  });
};

  const handleExport = async () => {
    if (txList.length === 0) {
      toast.info("No transactions to export");
      return;
    }

    setIsExporting(true);
    try {
      const doc = (
        <TransactionsPdf
          transactions={txList}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBalance={totalBalance}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export transactions", error);
      toast.error("Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredTransactions = txList.filter((tx: Transaction) => {
    const matchesSearch =
      (tx.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (tx.category ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || tx.category === selectedCategory;

    const matchesType =
      selectedType === "all" || tx.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalIncome = txList
    .filter((tx: Transaction) => tx.type === "income")
    .reduce((acc: number, tx: Transaction) => acc + tx.amount, 0);

  const totalExpense = Math.abs(
    txList
      .filter((tx: Transaction) => tx.type === "expense")
      .reduce((acc: number, tx: Transaction) => acc + tx.amount, 0)
  );

  const totalBalance = accountList.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  );

  const displayedCategories =
    selectedType === "income"
      ? ["All", ...incomeCategories]
      : selectedType === "expense"
      ? ["All", ...expenseCategories]
      : ["All", ...incomeCategories, ...expenseCategories];

  const isData = txList.length > 0;

  if (txError) {
    return <div>Failed to load transactions.</div>;
  }

  return (
    <div
      className={`space-y-6 ${
        mutation.isPending ? "pointer-events-none opacity-50" : ""
      }`}
    >
   
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="group relative bg-card hidden md:block border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${0 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total Balance</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                Rs {(totalBalance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>

        <div
          className="group relative bg-green-500/15 border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${1 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden"/> Income</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                Rs &nbsp;&nbsp;{totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div
          className="group relative bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${2 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden"/> Expenses</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                Rs &nbsp;&nbsp;{totalExpense.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
          </div>
        </div>
      </div>

   
      <div className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-4 duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={ { animationDelay: `${3 * 100}ms`, animationFillMode: "both" }}>
        <div className="flex w-full flex-wrap items-center gap-3 ">
          <div className="flex w-full items-center gap-4 justify-between">   
             <div className="relative w-full w-auto md:w-[450px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10  md:w-full bg-secondary border-border"
            />
          </div>
           <Button
          className=" bg-primary/90 px-6 cursor-pointer hover:bg-primary text-primary-foreground sm:w-auto"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-0 md:mr-2" />
          Add <span className="hidden md:inline"> Transaction</span>
        </Button>
        </div>
      

          <div className="flex mt-2 w-full items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {["all", "income", "expense"].map((type) => (
              <Button
                key={type}
                variant={
                  selectedType === type ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setSelectedType(
                    type as "all" | "income" | "expense"
                  )
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          <div className="block md:hidden"> <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="w-auto shrink-0 sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button></div>
           
          </div>

          

        </div>

       
      </div>

    
      <div
        className="hidden md:flex flex-col items-start justify-between gap-3 pb-2 duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:flex-row sm:items-center"
        style={{ animationDelay: `${3 * 100}ms`, animationFillMode: "both" }}
      >
        <div className="flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
          {displayedCategories.slice(0, visibleCategories).map((cat) => (
            <Button
              key={cat}
              variant={
                selectedCategory === cat ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="w-full shrink-0 sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>

      {/* Transactions Loading Skeleton */}
      {loading && (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Account
                    </th>

                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>

                    <th className="w-12"></th>
                  </tr>
                </thead>

                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>

                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-32" />
                      </td>

                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>

                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-24" />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>

                      <td className="py-4 px-4">
                        <Skeleton className="h-8 w-8" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isData && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No transactions yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first transaction to start tracking</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && isData && (
        <Card className="border-border bg-card overflow-hidden  duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"    style={ { animationDelay: `${3 * 100}ms`, animationFillMode: "both" }}>
          <CardContent className="p-0 flex flex-col h-[460px]">
            {/* TABLE */}
            <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
              <table className="w-full min-w-[640px]">
                <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Account
                    </th>

                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>

                    <th className="w-12"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(
                      (tx: Transaction, index: number) => (
                        <tr
                          key={tx.id}
                          className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <span className="text-sm text-muted-foreground">
                              {tx.date}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  tx.type === "income"
                                    ? "bg-accent/60"
                                    : "bg-destructive/10"
                                }`}
                              >
                                {tx.type === "income" ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-destructive" />
                                )}
                              </div>

                              <span className="text-sm font-medium text-foreground">
                                {tx.description}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <Badge variant="outline">
                              {tx.category}
                            </Badge>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-sm text-muted-foreground">
                              {tx.account}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <span
                              className={`text-sm font-semibold ${
                                tx.type === "income"
                                  ? "text-green-400"
                                  : "text-destructive"
                              }`}
                            >
                              {tx.type === "income" ? "+" : "-"} Rs{" "}
                              {Math.abs(tx.amount).toLocaleString()}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="h-[400px] flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">
                            Nothing in this category
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="border-t border-border p-4 bg-secondary/20">
              {selectedCategory !== "All" ? (
                (() => {
                  const categoryTransactions =
                    filteredTransactions.filter(
                      (tx: Transaction) =>
                        tx.category === selectedCategory
                    );

                  const categoryTotal =
                    categoryTransactions.reduce(
                      (acc: number, tx: Transaction) =>
                        tx.type === "expense"
                          ? acc - tx.amount
                          : acc + tx.amount,
                      0
                    );

                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total for {selectedCategory}
                        </p>

                        <p
                          className={`text-lg font-bold ${
                            categoryTotal >= 0
                              ? "text-green-500"
                              : "text-destructive"
                          }`}
                        >
                          {categoryTotal >= 0 ? "+" : "-"} Rs{" "}
                          {Math.abs(
                            categoryTotal
                          ).toLocaleString()}
                        </p>
                      </div>

                      <Badge variant="outline">
                        {categoryTransactions.length} transaction
                        {categoryTransactions.length !== 1
                          ? "s"
                          : ""}
                      </Badge>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing all categories
                  </p>

                  <Badge variant="outline">
                    {filteredTransactions.length} transactions
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen} 
      >
        <DialogContent aria-describedby={undefined} className="max-w-[380px] md:max-w-[425px] bg-white/13 backdrop-blur-3xl ">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>

          <div className="grid  gap-2 md:gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Type</label>

              <Select
                value={newTxType}
                onValueChange={(v) =>
                  setNewTxType(v as "income" | "expense")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="expense">
                    Expense
                  </SelectItem>

                  <SelectItem value="income">
                    Income
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Description
              </label>

              <Input
                placeholder="e.g., Grocery Shopping"
                value={newTxDescription}
                onChange={(e) =>
                  setNewTxDescription(e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Amount
              </label>

              <Input
                type="number"
                placeholder="0"
                value={newTxAmount}
                onChange={(e) =>
                  setNewTxAmount(e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Category
              </label>

              <Select
                value={newTxCategory}
                onValueChange={setNewTxCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {(newTxType === "income"
                    ? incomeCategories
                    : expenseCategories
                  ).map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Account
              </label>

              <Select
                value={selectedNewTxAccountId}
                onValueChange={setNewTxAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>

                <SelectContent>
                  {accountList.map((acc: Account) => (
                    <SelectItem
                      key={acc.id}
                      value={acc.id}
                    >
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddTransaction}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
