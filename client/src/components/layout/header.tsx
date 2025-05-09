import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import LoginModal from "@/components/auth/login-modal";
import RegisterModal from "@/components/auth/register-modal";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
    if (showRegisterModal) setShowRegisterModal(false);
  };
  
  const toggleRegisterModal = () => {
    setShowRegisterModal(!showRegisterModal);
    if (showLoginModal) setShowLoginModal(false);
  };
  
  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-montserrat font-semibold tracking-wider text-foreground">
              ELEV8
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/products/women" 
                className={`nav-link text-foreground font-montserrat text-sm uppercase tracking-wider ${location === '/products/women' ? 'text-accent' : ''}`}
              >
                Women
              </Link>
              <Link 
                href="/products/men" 
                className={`nav-link text-foreground font-montserrat text-sm uppercase tracking-wider ${location === '/products/men' ? 'text-accent' : ''}`}
              >
                Men
              </Link>
              <Link 
                href="/products/accessories" 
                className={`nav-link text-foreground font-montserrat text-sm uppercase tracking-wider ${location === '/products/accessories' ? 'text-accent' : ''}`}
              >
                Accessories
              </Link>
              <Link 
                href="/products" 
                className={`nav-link text-foreground font-montserrat text-sm uppercase tracking-wider ${location === '/products' ? 'text-accent' : ''}`}
              >
                All Products
              </Link>
            </nav>
            
            {/* Icons */}
            <div className="flex items-center space-x-6">
              <button className="text-foreground hover:text-accent transition-colors">
                <i className="ri-search-line text-xl"></i>
              </button>
              
              {user ? (
                <div className="relative group">
                  <button className="text-foreground hover:text-accent transition-colors">
                    <i className="ri-user-line text-xl"></i>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-lg rounded-md hidden group-hover:block">
                    <div className="py-2 px-4 border-b border-border">
                      <p className="text-sm font-medium">Hello, {user.firstName || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                        My Account
                      </Link>
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                        My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                          Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  className="text-foreground hover:text-accent transition-colors"
                  onClick={toggleLoginModal}
                >
                  <i className="ri-user-line text-xl"></i>
                </button>
              )}
              
              <button className="text-foreground hover:text-accent transition-colors">
                <i className="ri-heart-line text-xl"></i>
              </button>
              
              <Link href="/cart" className="text-foreground hover:text-accent transition-colors relative">
                <i className="ri-shopping-bag-line text-xl"></i>
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center p-0">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
              
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="md:hidden text-foreground hover:text-accent transition-colors">
                    <i className="ri-menu-line text-xl"></i>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-card p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border">
                      <h2 className="font-montserrat text-xl font-medium">Menu</h2>
                    </div>
                    <nav className="flex-1 overflow-auto">
                      <div className="py-2">
                        <Link href="/products/women" className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground">
                          Women
                        </Link>
                        <Link href="/products/men" className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground">
                          Men
                        </Link>
                        <Link href="/products/accessories" className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground">
                          Accessories
                        </Link>
                        <Link href="/products" className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground">
                          All Products
                        </Link>
                      </div>
                      <div className="border-t border-border py-2">
                        <Link href="/account" className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground">
                          My Account
                        </Link>
                        <Link href="/cart" className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground">
                          Cart ({cartItemCount})
                        </Link>
                        {user ? (
                          <button 
                            onClick={logout}
                            className="block w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground"
                          >
                            Logout
                          </button>
                        ) : (
                          <button 
                            onClick={toggleLoginModal}
                            className="block w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground"
                          >
                            Login
                          </button>
                        )}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onRegisterClick={toggleRegisterModal}
      />
      
      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onLoginClick={toggleLoginModal}
      />
    </>
  );
}
