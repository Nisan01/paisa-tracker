import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type TripPdf = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "upcoming" | "active" | "completed";
  createdAt?: string;
};

type TripExpensePdf = {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

type TripReceiptPdfProps = {
  trip: TripPdf;
  expenses: TripExpensePdf[];
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
    position: "relative",
  },
  headerLeft: {
    width: "70%",
    flexDirection: "column",
  },
  headerRight: {
    width: 160,
    alignItems: "flex-end",
    position: "absolute",
    top: 0,
    right: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  exportedOnRight: {
    marginTop: 6,
  },
  exportedOnWrap: {
    width: "100%",
    alignItems: "flex-end",
  },
  exportedOn: {
    lineHeight: 1.3,
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
  colDate: { width: "20%" },
  colDesc: { width: "40%" },
  colCategory: { width: "20%" },
  colAmount: { width: "20%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px solid #E5E7EB",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 11,
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

export function TripReceiptPdf({ trip, expenses }: TripReceiptPdfProps) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const exportDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Trip Receipt</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>Status</Text>
            <Text style={styles.infoValue}>{trip.status.toUpperCase()}</Text>
            <View style={styles.exportedOnWrap}>
              <Text style={[styles.subtitle, styles.exportedOnRight]}>
                 Exported on {exportDate}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trip Name</Text>
            <Text style={styles.infoValue}>{trip.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Destination</Text>
            <Text style={styles.infoValue}>{trip.destination}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dates</Text>
            <Text style={styles.infoValue}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Budget</Text>
            <Text style={styles.infoValue}>{formatCurrency(trip.budget)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          {expenses.length === 0 ? (
            <Text style={styles.muted}>No expenses added yet.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={styles.colDate}>Date</Text>
                <Text style={styles.colDesc}>Description</Text>
                <Text style={styles.colCategory}>Category</Text>
                <Text style={styles.colAmount}>Amount</Text>
              </View>
              {expenses.map((exp) => (
                <View key={exp.id} style={styles.tableRow}>
                  <Text style={styles.colDate}>{formatDate(exp.date)}</Text>
                  <Text style={styles.colDesc}>{exp.description}</Text>
                  <Text style={styles.colCategory}>{exp.category}</Text>
                  <Text style={styles.colAmount}>-{formatCurrency(exp.amount)}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}
