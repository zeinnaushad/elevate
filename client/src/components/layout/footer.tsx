import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-montserrat font-semibold tracking-wider text-foreground">
              ELEV8
            </Link>
            <p className="text-muted-foreground mt-4 mb-6">
              Discover elegance redefined with our curated collections of timeless fashion pieces.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                <i className="ri-facebook-line text-xl"></i>
              </a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                <i className="ri-pinterest-line text-xl"></i>
              </a>
            </div>
          </div>
          
          {/* Shop */}
          <div>
            <h3 className="font-montserrat text-lg font-medium text-foreground mb-6">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/products/women" className="text-muted-foreground hover:text-accent transition-colors">Women</Link></li>
              <li><Link href="/products/men" className="text-muted-foreground hover:text-accent transition-colors">Men</Link></li>
              <li><Link href="/products/accessories" className="text-muted-foreground hover:text-accent transition-colors">Accessories</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-accent transition-colors">New Arrivals</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-accent transition-colors">Sale</Link></li>
            </ul>
          </div>
          
          {/* Help */}
          <div>
            <h3 className="font-montserrat text-lg font-medium text-foreground mb-6">Help</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Customer Service</a></li>
              <li><Link href="/account" className="text-muted-foreground hover:text-accent transition-colors">My Account</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Find a Store</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Legal & Privacy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-montserrat text-lg font-medium text-foreground mb-6">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="ri-map-pin-line text-accent mt-1 mr-3"></i>
                <span className="text-muted-foreground">123 Fashion Street, New York, NY 10001, United States</span>
              </li>
              <li className="flex items-center">
                <i className="ri-phone-line text-accent mr-3"></i>
                <span className="text-muted-foreground">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center">
                <i className="ri-mail-line text-accent mr-3"></i>
                <span className="text-muted-foreground">contact@elev8-fashion.com</span>
              </li>
              <li className="flex items-center">
                <i className="ri-time-line text-accent mr-3"></i>
                <span className="text-muted-foreground">Mon - Fri: 9am - 10pm</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted order-2 md:order-1 mt-4 md:mt-0 text-sm">
            &copy; {new Date().getFullYear()} ELEV8. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4 order-1 md:order-2">
            <div className="flex items-center space-x-2">
              <i className="ri-visa-line text-foreground text-2xl"></i>
              <i className="ri-mastercard-line text-foreground text-2xl"></i>
              <i className="ri-paypal-line text-foreground text-2xl"></i>
              <i className="ri-amazon-pay-line text-foreground text-2xl"></i>
            </div>
            <span className="text-muted text-xs font-montserrat">Secure Payment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
