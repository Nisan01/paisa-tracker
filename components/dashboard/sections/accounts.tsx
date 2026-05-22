"use client";

import { useEffect, useState } from "react";
import {
  Card,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Wallet, Building2, Smartphone, Banknote, TrendingUp, CreditCard, MoreHorizontal, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  isDefault?: boolean;
};

const accountTypeConfig: Record<string, {
  icon: React.ElementType;
  label: string;
  cardBg: string;
  iconBg: string;
  iconColor: string;
}> = {
  bank: { icon: Building2, label: "Bank", cardBg: "bg-blue-500/55", iconBg: "bg-blue-500/10", iconColor: "text-blue-600" },
  cash: { icon: Banknote, label: "Cash", cardBg: "bg-green-500/65", iconBg: "bg-green-500/10", iconColor: "text-green-600" },
  wallet: { icon: Wallet, label: "Wallet", cardBg: "bg-yellow-500/65", iconBg: "bg-yellow-500/10", iconColor: "text-yellow-600" },
  other: { icon: Smartphone, label: "Other", cardBg: "bg-purple-500/65", iconBg: "bg-purple-500/10", iconColor: "text-purple-600" },

};

const defaultConfig = { icon: Wallet, label: "Other", cardBg: "bg-green-500/5", iconBg: "bg-green-500/10", iconColor: "text-green-600" };

export function AccountsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [openMenuAccountId, setOpenMenuAccountId] = useState<string | null>(null);

  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [newAccountType, setNewAccountType] = useState("bank");


  const [isDefault, setIsDefault] = useState("no");


  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const fetchAccounts = async () => {

    const res = await fetch("/api/dashboard/account?userId=" + session?.user?.id);

    if (!res.ok) {
      throw new Error("Failed to fetch accounts");
    }

    return await res.json();
  }

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["accounts", session?.user?.id],

    queryFn: fetchAccounts,

    enabled: !!session?.user?.id,

    staleTime: 1000 * 60 * 5,
  });
  const accountList = data?.accounts || [];
  const isAccountsAvailable = accountList.length > 0;


  const totalBalance = accountList.reduce(
    (acc, a) => acc + Number(a?.balance ?? 0),
    0
  );

  const filteredAccounts = accountList.filter((acc) =>
    (acc?.name ?? "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  // =========================
  // ADD ACCOUNT
  // =========================

  const createAccount = async (payload: any) => {
    const res = await fetch("/api/dashboard/account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to create account");
    }

    return res.json();
  };

  const mutation = useMutation({
    mutationFn: createAccount,

    onSuccess: () => {
      toast.success("Account added successfully!");

      queryClient.invalidateQueries({
        queryKey: ["accounts", session?.user?.id],
      });

      setIsAddDialogOpen(false);
      setNewAccountName("");
      setNewAccountBalance("");
      setNewAccountType("bank");
      setIsDefault("no");
    },

    onError: () => {
      toast.error("Failed to add account");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (payload: { accountId: string }) => {
      const res = await fetch(`/api/dashboard/account?accountId=${payload.accountId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Account deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["accounts", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", session?.user?.id] });
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });


  const handleAddAccount = () => {
    if (!newAccountName || !newAccountBalance) return;

    mutation.mutate({
      userId: session?.user?.id,
      name: newAccountName,
      type: newAccountType,
      balance: parseFloat(newAccountBalance),
      isDefault: isDefault === "yes",
    });
  };

  const handleDeleteAccount = () => {
    if (!accountToDelete) return;
    deleteAccountMutation.mutate({
      accountId: accountToDelete.id,
    });
  };


  const isBalanceValid =
  newAccountBalance !== "" &&
  !isNaN(Number(newAccountBalance)) &&
  Number(newAccountBalance) >= 0;

const isFormValid =
  newAccountName.trim() !== "" && isBalanceValid;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".account-menu")) {
        setOpenMenuAccountId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (error) {
    return <div>Failed to load accounts.</div>;
  }


  return (
    <div className={`space-y-6 ${mutation.isPending ? "pointer-events-none opacity-50" : ""}`}>

      {/* Summary Cards - Match Overview Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Total Balance Card */}
        <div className="group relative bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        style={
          { animationDelay: `${0 * 100}ms`, animationFillMode: "both" }
        }>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total Balance</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                Rs {(totalBalance ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {accountList.length} account{accountList.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Active Accounts Card */}
        <div className="group relative bg-green-500/10 border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
         style={
          { animationDelay: `${1 * 100}ms`, animationFillMode: "both" }
        }>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Active Accounts</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{accountList.length}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All synced
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>


      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4  transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        style={
          { animationDelay: `${2 * 100}ms`, animationFillMode: "both" }
        }>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80  h-9 bg-card border-border"
            />
          </div>
          <Badge variant="outline" className="px-3 py-1.5 text-sm">
            {filteredAccounts.length} account{filteredAccounts.length !== 1 ? "s" : ""}
          </Badge>
        </div>


        <Button className="bg-primary/90 px-20   cursor-pointer hover:bg-primary text-primary-foreground" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>

      </div>

      {/* Dialog */}


      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] bg-white/10 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2">

            <Input
              placeholder="Account name"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            />

            <Select
              value={newAccountType}
              onValueChange={setNewAccountType}
            >
              <SelectTrigger className="w-full bg-gray-600 text-white border rounded-md">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>

              <SelectContent className="bg-gray-700 text-white">
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
<Input
  type="number"
  placeholder="Balance"
  min="0"
  step="0.01"
  value={newAccountBalance}
  onChange={(e) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setNewAccountBalance(value);
    }
  }}
/>

            {/* ✅ YES / NO RADIO */}
            <div>
              <p className="text-sm font-medium">Default Account</p>

              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="default"
                    value="yes"
                    checked={isDefault === "yes"}
                    onChange={(e) => setIsDefault(e.target.value)}
                  />
                  <span className="text-sm">Yes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="default"
                    value="no"
                    checked={isDefault === "no"}
                    onChange={(e) => setIsDefault(e.target.value)}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
       <Button
  onClick={handleAddAccount}
  disabled={!isFormValid || mutation.isPending}
>
  {!mutation.isPending ? "Save" : "Saving..."}
</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-14" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-28" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isAccountsAvailable && !loading && filteredAccounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No accounts yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first account to start tracking</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      )}

      {/* Account Cards Grid */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account, index) => {
            const config = accountTypeConfig[account.type] || defaultConfig;
            const Icon = config.icon;

            return (
              <div
                key={account.id}
                className={`group relative rounded-2xl p-5 overflow-hidden flex flex-col justify-between min-h-[140px] cursor-pointer transition-all duration-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 hover:scale-[1.01] ${config.cardBg} ${openMenuAccountId === account.id ? "z-30" : ""}`}
                style={{ animationDelay: `${(index+2) * 100}ms`, animationFillMode: "both" }}
              >
                {/* Shine overlay */}
                <div className="card-shine pointer-events-none absolute top-[-40%] left-[-20%] w-[60%] h-[180%] rounded-[50%]" />
                {/* Decorative circles */}
                <div className="card-circles pointer-events-none absolute -right-6 -bottom-6 w-28 h-28 rounded-full border border-white/15" />

                {/* Top row */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="chip w-9 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/70 font-medium">{config.label}</span>
                    <div className="relative account-menu">
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuAccountId(
                            openMenuAccountId === account.id ? null : account.id
                          );
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenuAccountId === account.id && (
                        <div className="account-menu absolute right-0 mt-2 w-32 bg-popover border border-border rounded-lg shadow-xl z-[60] overflow-hidden">
                          <button
                            className="w-full cursor-pointer px-3 py-2 text-left text-sm text-destructive hover:bg-secondary flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuAccountId(null);
                              setAccountToDelete(account);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="relative z-10 space-y-1">
                  <p className="text-sm text-white/90 font-medium truncate">{account.name}</p>
                  <p className="text-[22px] font-medium text-white tracking-tight">Rs {Number(account.balance).toLocaleString()}</p>
                  {account.isDefault && (
                    <div className="flex items-center gap-1 text-[10px] text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Default
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" /> Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{accountToDelete?.name}</span>? This will
              also delete all transactions linked to this account and cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setAccountToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}