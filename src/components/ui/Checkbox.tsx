"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={cn(
            "mt-0.5 h-5 w-5 rounded border-gray-300 text-primary-600",
            "focus:ring-primary-500 cursor-pointer shrink-0"
          )}
          {...props}
        />
        <label htmlFor={checkboxId} className="cursor-pointer">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
