import { createContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CartItem, Product } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

interface AddToCartData {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  addToCart: (data: AddToCartData) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      // If not authenticated, clear cart and set loading to false
      setCartItems([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  const fetchCartItems = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Fetch product details for each cart item
        const cartItemsWithProducts = await Promise.all(
          data.map(async (item: CartItem) => {
            try {
              const productRes = await fetch(`/api/products/${item.productId}`);
              if (productRes.ok) {
                const product = await productRes.json();
                return { ...item, product };
              }
              return item;
            } catch (error) {
              console.error(`Error fetching product ${item.productId}:`, error);
              return item;
            }
          })
        );
        
        setCartItems(cartItemsWithProducts);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load your cart. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addToCart = async (data: AddToCartData) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const res = await apiRequest("POST", "/api/cart", data);
      const newItem = await res.json();
      
      // Fetch product details for the new cart item
      const productRes = await fetch(`/api/products/${data.productId}`);
      if (productRes.ok) {
        const product = await productRes.json();
        
        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(
          item => item.id === newItem.id
        );
        
        if (existingItemIndex !== -1) {
          // Update existing item
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex] = { 
            ...newItem, 
            product 
          };
          setCartItems(updatedItems);
        } else {
          // Add new item
          setCartItems([...cartItems, { ...newItem, product }]);
        }
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const updateCartItem = async (id: number, quantity: number) => {
    try {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      const updatedItem = await res.json();
      
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, ...updatedItem } : item
        )
      );
    } catch (error) {
      console.error("Error updating cart item:", error);
      toast({
        title: "Error",
        description: "Failed to update cart item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const removeFromCart = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/cart/${id}`);
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const clearCart = async () => {
    try {
      await apiRequest("DELETE", "/api/cart");
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
