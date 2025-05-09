import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Account from "@/pages/account";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/products" component={Products}/>
      <Route path="/products/:category" component={Products}/>
      <Route path="/product/:id" component={ProductDetail}/>
      <Route path="/cart" component={Cart}/>
      <Route path="/checkout" component={Checkout}/>
      <Route path="/account" component={Account}/>
      <Route path="/admin" component={AdminDashboard}/>
      <Route path="/admin/products" component={AdminProducts}/>
      <Route path="/admin/orders" component={AdminOrders}/>
      <Route path="/admin/users" component={AdminUsers}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
