import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

// Form schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  country: z.string().min(2, "Country is required"),
  sameAsBilling: z.boolean().default(true),
  // Payment details fields
  cardName: z.string().min(2, "Cardholder name is required"),
  cardNumber: z.string().min(16, "Card number is required"),
  expiryMonth: z.string().min(1, "Expiry month is required"),
  expiryYear: z.string().min(1, "Expiry year is required"),
  cvv: z.string().min(3, "CVV is required"),
  savePaymentInfo: z.boolean().default(false),
});

export default function Checkout() {
  const [, navigate] = useLocation();
  const { cartItems, isLoading: isCartLoading, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      country: user?.country || "United States",
      sameAsBilling: true,
      cardName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      savePaymentInfo: false,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Build shipping address object
      const shippingAddress = {
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
        phone: values.phone,
      };
      
      // Build payment details object (in a real application, this would be handled securely)
      const paymentDetails = {
        cardName: values.cardName,
        cardNumberLast4: values.cardNumber.slice(-4),
        expiryMonth: values.expiryMonth,
        expiryYear: values.expiryYear,
        // In a real app, we would never store the full card number or CVV
      };
      
      // Calculate order total
      const subtotal = getCartTotal();
      const shipping = subtotal > 100 ? 0 : 10;
      const total = subtotal + shipping;
      
      // Prepare order items
      const items = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.discountPrice || item.product?.price || 0,
        size: item.size,
        color: item.color,
      }));
      
      // Create order
      const res = await apiRequest("POST", "/api/orders", {
        total,
        shippingAddress,
        paymentDetails,
        items,
      });
      
      const orderData = await res.json();
      
      // Clear the cart after successful order
      await clearCart();
      
      // Show success message
      toast({
        title: "Order placed successfully!",
        description: `Your order #${orderData.id} has been confirmed`,
      });
      
      // Redirect to success page or account page
      navigate("/account");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <i className="ri-login-circle-line text-6xl text-accent mb-4"></i>
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please login to proceed with checkout.
          </p>
          <Button asChild className="w-full mb-4">
            <a href="/products">Browse Products</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (isCartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-montserrat font-light mb-8">Check<span className="font-medium">out</span></h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-10 w-1/4 mb-6" />
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="mb-6">
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
            <div>
              <Skeleton className="h-10 w-1/2 mb-6" />
              <div className="border border-border rounded-md p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <div className="space-y-4 mb-6">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
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
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <i className="ri-shopping-bag-line text-6xl text-accent mb-4"></i>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Button asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;
  
  // Generate month and year options for card expiry
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-montserrat font-light mb-8">Check<span className="font-medium">out</span></h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Information */}
                <div>
                  <h2 className="text-xl font-montserrat font-medium mb-6">Shipping Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip/Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="sameAsBilling"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Billing address is the same as shipping address
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Payment Information */}
                <div>
                  <h2 className="text-xl font-montserrat font-medium mb-6">Payment Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="As it appears on the card" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="1234 5678 9012 3456" 
                            maxLength={19}
                            onChange={(e) => {
                              // Format card number with spaces every 4 digits
                              const value = e.target.value.replace(/\s/g, '');
                              const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <FormLabel>Expiration Date</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="expiryMonth"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="MM" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                      {month.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="expiryYear"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="YYYY" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year.value} value={year.value}>
                                      {year.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              maxLength={4}
                              placeholder="123" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="savePaymentInfo"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Save this payment method for future purchases
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-montserrat font-medium mb-6">Order Summary</h2>
                
                <div className="border border-border rounded-md p-6 sticky top-24">
                  <div className="max-h-80 overflow-y-auto mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 mb-4">
                        <img
                          src={item.product?.imageUrls?.[0]}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium line-clamp-1">{item.product?.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.size && `Size: ${item.size}`} 
                            {item.size && item.color && " | "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs">Qty: {item.quantity}</span>
                            <span className="text-xs font-medium">
                              {formatPrice((item.product?.discountPrice || item.product?.price || 0) * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  <div className="space-y-3 mb-6">
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
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By placing your order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </main>
      
      <Footer />
    </div>
  );
}
