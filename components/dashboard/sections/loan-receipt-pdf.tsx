import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type LoanPdf = {
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
};

type LoanReceiptPdfProps = {
  loan: LoanPdf;
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    marginLeft:1
  },
  section: {
    marginTop: 12,
    border: "1px solid #E5E7EB",
    padding: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    color: "#6B7280",
  },
  infoValue: {
    fontWeight: 600,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  summaryCard: {
    width: "32%",
    border: "1px solid #E5E7EB",
    padding: 8,
    borderRadius: 6,
  },
  summaryLabel: {
    color: "#6B7280",
    fontSize: 9,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  muted: {
    color: "#6B7280",
  },
});

const formatDate = (date: string) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return `Rs ${amount.toLocaleString("en-US")}`;
};

export function LoanReceiptPdf({ loan }: LoanReceiptPdfProps) {
  const exportDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const paidAmount = Math.max(0, loan.amount - loan.remaining);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Loan Receipt</Text>
            <Text style={styles.subtitle}>Exported on {exportDate}</Text>
          </View>
          <View>
            <Text style={styles.subtitle}>Status</Text>
            <Text style={styles.infoValue}>{loan.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Borrower Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Person</Text>
            <Text style={styles.infoValue}>{loan.person}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{loan.phone || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{loan.type.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date</Text>
            <Text style={styles.infoValue}>{formatDate(loan.dueDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDate(loan.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(loan.amount)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={styles.summaryValue}>{formatCurrency(paidAmount)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={styles.summaryValue}>{formatCurrency(loan.remaining)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.muted}>{loan.notes?.trim() || "No notes added."}</Text>
        </View>
      </Page>
    </Document>
  );
}
