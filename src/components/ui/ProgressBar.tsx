import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
}: ProgressBarProps) {
  const porcentaje = Math.min(Math.round((value / max) * 100), 100);

  const colorClase =
    porcentaje <= 20
      ? "bg-red-500"
      : porcentaje <= 50
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", colorClase)}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 w-8 text-right">
          {porcentaje}%
        </span>
      )}
    </div>
  );
}
