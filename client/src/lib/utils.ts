import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

export function getStarRating(rating: number): { filled: number, half: boolean, empty: number } {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - filled - (half ? 1 : 0);
  
  return { filled, half, empty };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateDiscountPercentage(originalPrice: number, discountPrice: number): number {
  if (!discountPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

export function generateSizeOptions(): string[] {
  return ['XS', 'S', 'M', 'L', 'XL'];
}

export function generateColorOptions(): { name: string, value: string }[] {
  return [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Beige', value: '#E8DCCA' },
    { name: 'Brown', value: '#964B00' },
    { name: 'Gray', value: '#808080' },
    { name: 'Silver', value: '#C0C0C0' }
  ];
}
