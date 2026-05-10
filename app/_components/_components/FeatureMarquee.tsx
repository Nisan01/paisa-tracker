import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import { BsWallet2 } from "react-icons/bs";
import {
  TbArrowsExchange,
  TbReportMoney,
  TbRepeat,
  TbFileText,
} from "react-icons/tb";
import { BiBell } from "react-icons/bi";

const features = [
  {
    icon: BsWallet2,
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-400",
    num: "01",
    title: "Multi-account support",
    desc: "Cash, bank, eSewa, Khalti — unified balance across every source.",
    tag: "wallets",
  },
  {
    icon: TbArrowsExchange,
    bgColor: "bg-green-700/40",
    iconColor: "text-green-200",
    num: "02",
    title: "Income & expenses",
    desc: "Log every rupee with default or custom categories.",
    tag: "transactions",
  },
  {
    icon: TbReportMoney,
    bgColor: "bg-yellow-700/40",
    iconColor: "text-yellow-200",
    num: "03",
    title: "Loan management",
    desc: "Track lent and borrowed money with partial repayments.",
    tag: "loans",
  },
  {
    icon: BiBell,
    bgColor: "bg-red-700/40",
    iconColor: "text-red-200",
    num: "04",
    title: "Smart budgets & alerts",
    desc: "Set limits per category and get notified before overspending.",
    tag: "budgets",
  },
  {
    icon: TbFileText,
    bgColor: "bg-purple-700/40",
    iconColor: "text-purple-200",
    num: "05",
    title: "PDF exports",
    desc: "Clean statements for records and reimbursement.",
    tag: "reports",
  },
  {
    icon: TbRepeat,
    bgColor: "bg-orange-700/40",
    iconColor: "text-orange-200",
    num: "06",
    title: "Recurring reminders",
    desc: "Automated alerts so you never miss payments.",
    tag: "reminders",
  },
];

function FeatureCard({ f }: { f: (typeof features)[0] }) {
  const Icon = f.icon;

  return (
    <div className="w-[350px] shrink-0 flex flex-col gap-1.8 rounded-2xl border border-gray-400/20 border-border/30 hover:border-border/60 transition-all bg-black backdrop-blur-xl p-6 mx-2.5">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            f.bgColor
          )}
        >
          <Icon className={cn("text-[20px]", f.iconColor)} />
        </div>

        <span className="text-[11px] tracking-[2px] text-muted-foreground/50 font-medium">
          {f.num}
        </span>
      </div>

      <div>
        <p className="text-[15px] font-semibold mb-1">{f.title}</p>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {f.desc}
        </p>
      </div>

      <span className="text-[11px] text-muted-foreground/60 border border-border/30 rounded-full px-3 py-0.5 w-fit">
        {f.tag}
      </span>
    </div>
  );
}

export default function FeatureMarquee() {
  const doubled = [...features, ...features];

  return (
    <div className="relative  overflow-hidden py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

      <Marquee pauseOnHover className="[--duration:30s]">
        {doubled.map((f, i) => (
          <FeatureCard key={i} f={f} />
        ))}
      </Marquee>
    </div>
  );
}