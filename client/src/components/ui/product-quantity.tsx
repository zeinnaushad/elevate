import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ProductQuantityProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function ProductQuantity({ 
  value, 
  onChange, 
  min = 1, 
  max = 99,
  className 
}: ProductQuantityProps) {
  const [quantity, setQuantity] = useState(value);
  
  useEffect(() => {
    setQuantity(value);
  }, [value]);
  
  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange(newValue);
    }
  };
  
  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange(newValue);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      setQuantity(newValue);
      onChange(newValue);
    }
  };
  
  return (
    <div className={`flex border border-border ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="w-10 h-12 flex items-center justify-center text-foreground hover:text-accent"
        onClick={handleDecrease}
        disabled={quantity <= min}
      >
        <i className="ri-subtract-line"></i>
      </Button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleChange}
        min={min}
        max={max}
        className="w-12 h-12 bg-transparent text-center text-foreground focus:outline-none"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="w-10 h-12 flex items-center justify-center text-foreground hover:text-accent"
        onClick={handleIncrease}
        disabled={quantity >= max}
      >
        <i className="ri-add-line"></i>
      </Button>
    </div>
  );
}
