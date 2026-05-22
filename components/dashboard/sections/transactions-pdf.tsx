import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type TransactionPdf = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  account: string;
  date: string;
};

type TransactionsPdfProps = {
  transactions: TransactionPdf[];
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  exportedOn: {
    marginLeft: 4,
    marginTop: 4,
  },
  totalRecordsBox: {
    minWidth: 90,
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
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
  section: {
    marginTop: 8,
    border: "1px solid #E5E7EB",
    padding: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 6,
    marginBottom: 6,
    color: "#6B7280",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: "1px solid #F3F4F6",
  },
  colDate: { width: "14%" },
  colDesc: { width: "28%" },
  colCategory: { width: "18%" },
  colAccount: { width: "20%" },
  colAmount: { width: "20%", textAlign: "right" },
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

export function TransactionsPdf({
  transactions,
  totalIncome,
  totalExpense,
  totalBalance,
}: TransactionsPdfProps) {
  const exportDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Transactions Report</Text>
            <Text style={[styles.subtitle, styles.exportedOn]}>
              Exported on {exportDate}
            </Text>
          </View>
          <View style={styles.totalRecordsBox}>
            <Text style={styles.subtitle}>Total Records</Text>
            <Text>{transactions.length}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Balance</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalBalance)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expense</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Transactions</Text>
          {transactions.length === 0 ? (
            <Text style={styles.muted}>No transactions available.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={styles.colDate}>Date</Text>
                <Text style={styles.colDesc}>Description</Text>
                <Text style={styles.colCategory}>Category</Text>
                <Text style={styles.colAccount}>Account</Text>
                <Text style={styles.colAmount}>Amount</Text>
              </View>
              {transactions.map((tx) => (
                <View key={tx.id} style={styles.tableRow}>
                  <Text style={styles.colDate}>{formatDate(tx.date)}</Text>
                  <Text style={styles.colDesc}>{tx.description}</Text>
                  <Text style={styles.colCategory}>{tx.category}</Text>
                  <Text style={styles.colAccount}>{tx.account}</Text>
                  <Text style={styles.colAmount}>
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(tx.amount))}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}
