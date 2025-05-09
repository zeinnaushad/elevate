import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  size = "md",
  className 
}: StarRatingProps) {
  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  
  // Determine size class
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];
  
  return (
    <div className={cn("flex space-x-1", sizeClass, className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <i key={`full-${index}`} className="ri-star-fill text-accent"></i>
      ))}
      
      {/* Half star */}
      {hasHalfStar && <i className="ri-star-half-line text-accent"></i>}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <i key={`empty-${index}`} className="ri-star-line text-accent"></i>
      ))}
    </div>
  );
}
