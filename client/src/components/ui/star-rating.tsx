import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
}

export function StarRating({ value, onChange, max = 5, className }: StarRatingProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          className="transition-all hover:scale-110"
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              starValue <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}