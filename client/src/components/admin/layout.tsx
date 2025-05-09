import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center p-8">
          <i className="ri-lock-line text-6xl text-accent mb-4"></i>
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin area.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const menuItems = [
    { 
      icon: "ri-dashboard-line", 
      label: "Dashboard", 
      href: "/admin" 
    },
    { 
      icon: "ri-t-shirt-line", 
      label: "Products", 
      href: "/admin/products" 
    },
    { 
      icon: "ri-shopping-cart-line", 
      label: "Orders", 
      href: "/admin/orders" 
    },
    { 
      icon: "ri-user-line", 
      label: "Users", 
      href: "/admin/users" 
    }
  ];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-montserrat font-semibold tracking-wider text-foreground">
              ELEV8 <span className="text-accent text-sm">Admin</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.firstName || user?.username}
              </span>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <i className="ri-store-line mr-1"></i>
                  View Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border hidden md:block">
          <div className="p-4">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4">
              Admin Navigation
            </p>
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        location === item.href 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent/10"
                      }`}>
                        <i className={`${item.icon} mr-3 text-lg`}></i>
                        {item.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="md:hidden">
                <select 
                  className="bg-background border border-border rounded-md p-2 text-sm"
                  value={location}
                  onChange={(e) => window.location.href = e.target.value}
                >
                  {menuItems.map((item) => (
                    <option key={item.href} value={item.href}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Separator className="mt-4" />
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}
