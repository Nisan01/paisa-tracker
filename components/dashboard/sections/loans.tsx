"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Search,
  Plus,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowRightLeft,
  Edit,
  Trash2,
  DollarSign,
  Download,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { LoanReceiptPdf } from "@/components/dashboard/sections/loan-receipt-pdf";

interface Loan {
  id: string;
  person: string;
  phone: string;
  amount: number;
  remaining: number;
  dueDate: string;
  type: "lent" | "borrowed";
  status: "active" | "pending" | "paid";
  notes?: string;
  createdAt: string;
}

export function LoansSection({
  onLoanChange,
  refreshTrigger,
}: {
  onLoanChange?: () => void;
  refreshTrigger?: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] =
    useState<"all" | "lent" | "borrowed">("all");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [exportingLoanId, setExportingLoanId] = useState<string | null>(null);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const [newLoanPerson, setNewLoanPerson] = useState("");
  const [newLoanPhone, setNewLoanPhone] = useState("");
  const [newLoanType, setNewLoanType] =
    useState<"lent" | "borrowed">("lent");
  const [newLoanAmount, setNewLoanAmount] = useState("");
  const [newLoanDueDate, setNewLoanDueDate] = useState("");
  const [newLoanNotes, setNewLoanNotes] = useState("");

  const [editPerson, setEditPerson] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editType, setEditType] =
    useState<"lent" | "borrowed">("lent");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] =
    useState<"active" | "pending" | "paid">("active");
  const [editNotes, setEditNotes] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // ---------------- FETCH ----------------
  const fetchLoans = async () => {
    const res = await fetch(
      `/api/dashboard/loan?userId=${session?.user?.id}`
    );
    if (!res.ok) throw new Error("Failed to fetch loans");

    const data = await res.json();

    return (data.loans ?? []).map((l: any) => ({
      id: l.id,
      person: l.personName,
      phone: l.phone || "",
      amount: parseFloat(l.totalAmount),
      remaining: parseFloat(l.remainingAmount),
      dueDate: l.dueDate
        ? new Date(l.dueDate).toISOString().split("T")[0]
        : "",
      type: l.type,
      status: l.status,
      notes: l.notes || "",
      createdAt: l.createdAt
        ? new Date(l.createdAt).toISOString().split("T")[0]
        : "",
    }));
  };

  const {
    data: loanList = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ["loans", session?.user?.id],
    queryFn: fetchLoans,
    enabled: !!session?.user?.id,
  });

  // ---------------- FILTERS ----------------
  const filteredLoans = loanList.filter((loan) => {
    const matchesSearch =
      loan.person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.phone.includes(searchQuery);

    const matchesType =
      selectedType === "all" || loan.type === selectedType;

    return matchesSearch && matchesType;
  });

  const totalLent = loanList
    .filter((l) => l.type === "lent" && l.status !== "paid")
    .reduce((acc, l) => acc + l.remaining, 0);

  const totalBorrowed = loanList
    .filter((l) => l.type === "borrowed" && l.status !== "paid")
    .reduce((acc, l) => acc + l.remaining, 0);

  const totalPaidCount = loanList.filter(
    (l) => l.status === "paid"
  ).length;

  // ---------------- MUTATIONS ----------------
  const addLoanMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/dashboard/loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Loan added");
      queryClient.invalidateQueries({
        queryKey: ["loans", session?.user?.id],
      });
      setIsAddDialogOpen(false);
    },
  });

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, payload }: any) => {
      const res = await fetch(`/api/dashboard/loan?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Loan updated");
      queryClient.invalidateQueries({
        queryKey: ["loans", session?.user?.id],
      });
      setIsEditDialogOpen(false);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/dashboard/loan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries({
        queryKey: ["loans", session?.user?.id],
      });
      setIsPaymentDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const deleteLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dashboard/loan?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Loan deleted");
      queryClient.invalidateQueries({
        queryKey: ["loans", session?.user?.id],
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // ---------------- HANDLERS ----------------
  const handleAddLoan = () => {
    if (!session?.user?.id) {
      toast.error("Missing user session");
      return;
    }

    if (!newLoanPerson.trim() || !newLoanAmount) {
      toast.error("Person and amount are required");
      return;
    }

    setIsSaving(true);
    addLoanMutation.mutate(
      {
        userId: session.user.id,
        personName: newLoanPerson,
        phone: newLoanPhone,
        type: newLoanType,
        totalAmount: Number(newLoanAmount),
        remainingAmount: Number(newLoanAmount),
        dueDate: newLoanDueDate,
        notes: newLoanNotes,
      },
      { onSettled: () => setIsSaving(false) }
    );
  };

  const handleUpdateLoan = () => {
    if (!selectedLoan) return;
    setIsSaving(true);

    updateLoanMutation.mutate(
      {
        id: selectedLoan.id,
        payload: {
          personName: editPerson,
          phone: editPhone,
          type: editType,
          totalAmount: Number(editAmount),
          remainingAmount: selectedLoan.remaining,
          dueDate: editDueDate,
          status: editStatus,
          notes: editNotes,
        },
      },
      { onSettled: () => setIsSaving(false) }
    );
  };

  const handleRecordPayment = () => {
    if (!selectedLoan) return;
    const amount = Number(paymentAmount);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (amount > selectedLoan.remaining) {
      toast.error("Payment cannot exceed remaining amount");
      return;
    }
    setIsSaving(true);

    paymentMutation.mutate(
      {
        loanId: selectedLoan.id,
        amount,
      },
      { onSettled: () => setIsSaving(false) }
    );
  };

  const handleDeleteLoan = () => {
    if (!selectedLoan) return;
    setIsSaving(true);

    deleteLoanMutation.mutate(selectedLoan.id, {
      onSettled: () => setIsSaving(false),
    });
  };

  const handleExportLoan = async (loan: Loan) => {
    setExportingLoanId(loan.id);
    try {
      const doc = <LoanReceiptPdf loan={loan} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `loan-${loan.person.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export loan", error);
      toast.error("Failed to export loan");
    } finally {
      setExportingLoanId(null);
    }
  };

  const openEditDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    setEditPerson(loan.person);
    setEditPhone(loan.phone);
    setEditType(loan.type);
    setEditAmount(loan.amount.toString());
    setEditDueDate(loan.dueDate);
    setEditStatus(loan.status);
    setEditNotes(loan.notes || "");
    setIsEditDialogOpen(true);
  };

  const openPaymentDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentAmount(loan.remaining.toString());
    setIsPaymentDialogOpen(true);
  };

  const openDeleteDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDeleteDialogOpen(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: AlertCircle,
          color: "text-green-500",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
        };
      case "paid":
        return {
          icon: CheckCircle2,
          color: "text-muted-foreground",
          bg: "bg-secondary",
          border: "border-border",
        };
      default:
        return {
          icon: Clock,
          color: "text-muted-foreground",
          bg: "bg-secondary",
          border: "border-border",
        };
    }
  };

  return (
    <div
      className={`space-y-6 ${isSaving ? "pointer-events-none opacity-50" : ""}`}
    >
     

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    
        <div
          className="hidden md:block group relative bg-green-500/15 border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${1 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Loans <br className="inline md:hidden"/> Paid</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                   &nbsp;&nbsp;{totalPaidCount}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div
          className="group relative bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${1 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden"/> Lent</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                  Rs &nbsp;&nbsp;{totalLent.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-green-500" />
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
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden"/> Borrowed</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                  Rs &nbsp;&nbsp;{totalBorrowed.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-destructive" />
            </div>
          </div>
        </div>
      </div>

   

     

   
      <div className="flex  sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center w-full gap-3 flex-wrap">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search loans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 md:w-[545px] w-full bg-secondary border-border"
            />
          </div>

          <div className="flex items-center w-full  mt-2 gap-2">
            {(["all", "lent", "borrowed"] as const).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}

            <Button
          className="bg-primary/90 px-6 cursor-pointer ml-auto hover:bg-primary text-primary-foreground"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 md:mr-2" />
          Add <span className="hidden md:inline">Loan</span>
        </Button>
          </div>
        </div>

        
      </div>

      {/* Loading */}
      {loading && (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Person
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-16" />
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

      {!loading && loanList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <DollarSign className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No loans yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first loan to start tracking</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Loan
          </Button>
        </div>
      )}

  
      {!loading && loanList.length > 0 && (
        <Card className="border-border min-h-[49vh] md:min-h-[60vh] bg-card overflow-hidden ">
          <CardContent className="p-0">
            <div className="overflow-x-auto min-h-[49vh] scrollbar-none">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Person
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => {
                      const statusConfig = getStatusConfig(loan.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <tr
                          key={loan.id}
                          className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                  {loan.person}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {loan.phone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">
                              {loan.type}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-muted-foreground">
                              {loan.dueDate || "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-sm font-semibold">
                              Rs {loan.remaining.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant="outline"
                              className={`${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {loan.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(loan)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleExportLoan(loan)}
                                disabled={exportingLoanId === loan.id}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {loan.status !== "paid" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openPaymentDialog(loan)}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(loan)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="h-[240px] flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">
                            Nothing matches this filter
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Loan Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/13 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>Add Loan</DialogTitle>
            <DialogDescription>
              Add a new loan record with person, amount, and due date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={newLoanType}
                onValueChange={(v) => setNewLoanType(v as "lent" | "borrowed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lent">Lent</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Person</label>
              <Input
                placeholder="Person name"
                value={newLoanPerson}
                onChange={(e) => setNewLoanPerson(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="Phone"
                value={newLoanPhone}
                onChange={(e) => setNewLoanPhone(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                placeholder="0"
                value={newLoanAmount}
                onChange={(e) => setNewLoanAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Due date</label>
              <Input
                type="date"
                value={newLoanDueDate}
                onChange={(e) => setNewLoanDueDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Optional"
                value={newLoanNotes}
                onChange={(e) => setNewLoanNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddLoan} disabled={isSaving}>
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Loan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/13 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
            <DialogDescription>
              Update the loan details, status, or notes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Person</label>
              <Input value={editPerson} onChange={(e) => setEditPerson(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Phone</label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={editType}
                  onValueChange={(v) => setEditType(v as "lent" | "borrowed")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lent">Lent</SelectItem>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editStatus}
                  onValueChange={(v) => setEditStatus(v as "active" | "pending" | "paid")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Amount</label>
                <Input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Due date</label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Notes</label>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdateLoan} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white/10 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Choose a quick percentage or enter a custom amount.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="text-xs text-muted-foreground">
              Remaining: Rs {selectedLoan?.remaining.toLocaleString() ?? "0"}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 50].map((pct) => (
                <Button
                  key={pct}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const base = selectedLoan?.remaining ?? 0;
                    const computed = (base * pct) / 100;
                    setPaymentAmount(computed.toFixed(2));
                  }}
                >
                  {pct}%
                </Button>
              ))}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleRecordPayment} disabled={isSaving}>
              {isSaving ? "Saving..." : "Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white/10 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>Delete Loan</DialogTitle>
            <DialogDescription>
              This permanently deletes the loan.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteLoan}
              disabled={isSaving}
            >
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}