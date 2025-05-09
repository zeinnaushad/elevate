import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/ui/product-card";
import { CategoryCard } from "@/components/ui/category-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  
  // Fetch featured products
  const { data: featuredProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products?featured=true"],
  });
  
  // Debug what data is being returned
  console.log("Featured Products:", featuredProducts);
  
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] overflow-hidden">
          <div className="absolute inset-0 bg-black">
            <img 
              src="/attached_assets/Frilled mini White Dress.jpeg" 
              alt="Fashion model in elegant outfit" 
              className="object-cover w-full h-full opacity-80" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          <div className="container mx-auto px-4 h-full flex items-end pb-20 relative z-10">
            <div className="max-w-lg">
              <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight">
                Autumn <span className="font-medium">Collection</span> <span className="text-accent">2025</span>
              </h1>
              <p className="text-foreground/80 mt-4 mb-8 text-lg">
                Discover our latest collection featuring sophisticated silhouettes and premium fabrics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products/women">
                  <Button className="px-8 py-6 bg-accent text-accent-foreground font-montserrat font-medium hover:bg-accent/80 w-full sm:w-auto">
                    Shop Women
                  </Button>
                </Link>
                <Link href="/products/men">
                  <Button variant="outline" className="px-8 py-6 border-foreground text-foreground font-montserrat font-medium hover:bg-foreground/10 w-full sm:w-auto">
                    Shop Men
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-montserrat text-2xl md:text-3xl font-light text-center mb-12">Shop by <span className="font-medium">Category</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CategoryCard 
                title="Women" 
                image="/attached_assets/Sweet Pink Flare Sleeve Dress.jpeg" 
                link="/products/women" 
              />
              <CategoryCard 
                title="Men" 
                image="/attached_assets/Abercrombie's $50 Knit Polo Shirts Have No….jpeg" 
                link="/products/men" 
              />
              <CategoryCard 
                title="Accessories" 
                image="/attached_assets/Oxidized silver layered necklace.jpeg"
                link="/products/accessories" 
              />
            </div>
          </div>
        </section>
        
        {/* Featured Products Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-montserrat text-2xl md:text-3xl font-light">Featured <span className="font-medium">Products</span></h2>
              <div className="flex space-x-4">
                <button className="text-foreground hover:text-accent transition-colors">
                  <i className="ri-arrow-left-s-line text-2xl"></i>
                </button>
                <button className="text-foreground hover:text-accent transition-colors">
                  <i className="ri-arrow-right-s-line text-2xl"></i>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoadingProducts ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                ))
              ) : featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.slice(0, 4).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="lg:col-span-4 flex flex-col items-center justify-center h-96">
                  <i className="ri-shopping-bag-line text-5xl text-muted mb-4"></i>
                  <h3 className="text-xl font-medium mb-2">No featured products found</h3>
                  <p className="text-muted-foreground text-center">
                    Check out our product catalog to see all available items.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-12">
              <Link href="/products">
                <Button variant="outline" className="px-8 py-3 border-accent text-accent font-montserrat font-medium hover:bg-accent hover:text-accent-foreground">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-montserrat text-2xl md:text-3xl font-light text-foreground mb-4">Subscribe to Our <span className="font-medium">Newsletter</span></h2>
              <p className="text-muted-foreground mb-8">
                Be the first to know about new collections, exclusive offers, and fashion insights.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleNewsletter}>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 bg-card border border-border px-4 py-3 text-foreground focus:border-accent focus:outline-none"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="bg-accent text-accent-foreground font-montserrat font-medium px-6 py-3 hover:bg-accent/80"
                >
                  Subscribe
                </Button>
              </form>
              
              <p className="text-muted text-sm mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
