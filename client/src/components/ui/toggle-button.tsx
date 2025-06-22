import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  labels?: { yes: string; no: string };
  className?: string;
}

export function ToggleButton({ 
  value, 
  onChange, 
  labels = { yes: "SIM", no: "NÃO" },
  className 
}: ToggleButtonProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "px-4 py-2 text-sm font-medium border rounded-md transition-all",
          value === true
            ? "bg-green-600 text-white border-green-600 shadow-md"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        )}
      >
        {labels.yes}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "px-4 py-2 text-sm font-medium border rounded-md transition-all",
          value === false
            ? "bg-red-600 text-white border-red-600 shadow-md"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        )}
      >
        {labels.no}
      </button>
    </div>
  );
}