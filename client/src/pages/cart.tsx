import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ProductQuantity } from "@/components/ui/product-quantity";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/utils";

export default function Cart() {
  const { cartItems, isLoading, updateCartItem, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  
  const handleQuantityChange = async (id: number, quantity: number) => {
    setIsUpdating(id);
    await updateCartItem(id, quantity);
    setIsUpdating(null);
  };
  
  const handleRemove = async (id: number) => {
    setIsUpdating(id);
    await removeFromCart(id);
    setIsUpdating(null);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-montserrat font-light mb-8">Your <span className="font-medium">Cart</span></h1>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-md p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-24 h-24" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:w-80">
              <div className="border border-border rounded-md p-6">
                <Skeleton className="h-6 w-1/2 mb-6" />
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <i className="ri-login-circle-line text-6xl text-accent mb-4"></i>
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please login to view your cart and continue shopping.
          </p>
          <Button asChild className="w-full mb-4">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-montserrat font-light mb-8">Your <span className="font-medium">Cart</span></h1>
          <div className="text-center py-16 border border-border rounded-md">
            <i className="ri-shopping-bag-line text-6xl text-muted-foreground mb-4"></i>
            <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-montserrat font-light mb-8">Your <span className="font-medium">Cart</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            {cartItems.map((item) => (
              <div key={item.id} className="border border-border rounded-md p-4 mb-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <Link href={`/product/${item.productId}`}>
                    <img
                      src={item.product?.imageUrls?.[0]}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover"
                    />
                  </Link>
                  
                  <div className="flex-1">
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-medium hover:text-accent transition-colors">
                        {item.product?.name}
                      </h3>
                    </Link>
                    
                    {item.size && (
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size}
                      </p>
                    )}
                    
                    {item.color && (
                      <p className="text-sm text-muted-foreground">
                        Color: {item.color}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ProductQuantity
                      value={item.quantity}
                      onChange={(qty) => handleQuantityChange(item.id, qty)}
                      className="w-28"
                    />
                    
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-accent">
                        {formatPrice((item.product?.discountPrice || item.product?.price || 0) * item.quantity)}
                      </span>
                      
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-sm text-muted-foreground hover:text-accent transition-colors mt-1"
                        disabled={isUpdating === item.id}
                      >
                        {isUpdating === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="border border-border rounded-md p-6 sticky top-24">
              <h2 className="text-xl font-montserrat font-medium mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-accent">{formatPrice(total)}</span>
                </div>
              </div>
              
              <Button asChild className="w-full">
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Free shipping on orders over $100
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
