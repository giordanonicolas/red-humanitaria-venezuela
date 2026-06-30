import { type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "teal";
  className?: string;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    value: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    value: "text-green-700",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "bg-orange-100 text-orange-600",
    value: "text-orange-700",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    value: "text-red-700",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    value: "text-purple-700",
  },
  teal: {
    bg: "bg-teal-50",
    icon: "bg-teal-100 text-teal-600",
    value: "text-teal-700",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  className,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn("text-3xl font-bold mt-1", colors.value)}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-gray-400 mt-1">{trend}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl shrink-0", colors.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
