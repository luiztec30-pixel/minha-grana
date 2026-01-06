import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { clsx } from "clsx";

interface StatCardProps {
  title: string;
  value: number;
  type?: "neutral" | "positive" | "negative";
  icon?: React.ReactNode;
  subtitle?: string;
}

export function StatCard({ title, value, type = "neutral", icon, subtitle }: StatCardProps) {
  const isPositive = type === "positive";
  const isNegative = type === "negative";

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className={clsx(
            "text-2xl sm:text-3xl font-bold mt-2 font-display",
            isPositive && "text-emerald-600 dark:text-emerald-400",
            isNegative && "text-rose-600 dark:text-rose-400",
            type === "neutral" && "text-slate-900 dark:text-slate-100"
          )}>
            {formattedValue}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={clsx(
          "p-3 rounded-xl",
          isPositive && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
          isNegative && "bg-rose-50 text-rose-600 dark:bg-rose-900/20",
          type === "neutral" && "bg-slate-100 text-slate-600 dark:bg-slate-700"
        )}>
          {icon || <DollarSign className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
}
