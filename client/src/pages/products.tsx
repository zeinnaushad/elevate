import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Products() {
  const params = useParams();
  const category = params.category;
  
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    search: "",
    sortBy: "featured",
    colors: [] as string[],
    sizes: [] as string[],
  });
  
  // Build the query string based on filters
  const buildQueryString = () => {
    let query = "/api/products";
    const params = new URLSearchParams();
    
    if (category) {
      params.append("category", category);
    }
    
    if (filters.search) {
      params.append("search", filters.search);
    }
    
    const queryString = params.toString();
    return queryString ? `${query}?${queryString}` : query;
  };
  
  // Fetch products
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: [buildQueryString()],
  });
  
  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [category, filters.search, refetch]);
  
  // List of available colors and sizes
  const availableColors = [
    { name: "Black", value: "black" },
    { name: "White", value: "white" },
    { name: "Beige", value: "beige" },
    { name: "Brown", value: "brown" },
    { name: "Gray", value: "gray" },
    { name: "Silver", value: "silver" }
  ];
  
  const availableSizes = ["XS", "S", "M", "L", "XL"];
  
  // Filter products client-side for price and other filters not implemented in API
  const filteredProducts = products?.filter((product: any) => {
    const price = product.discountPrice || product.price;
    const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];
    
    const matchesColor = filters.colors.length === 0 || 
      (product.colors && product.colors.some((color: string) => 
        filters.colors.includes(color.toLowerCase())));
    
    const matchesSize = filters.sizes.length === 0 || 
      (product.sizes && product.sizes.some((size: string) => 
        filters.sizes.includes(size)));
    
    return matchesPrice && matchesColor && matchesSize;
  });
  
  // Sort products
  const sortedProducts = filteredProducts ? [...filteredProducts].sort((a: any, b: any) => {
    switch (filters.sortBy) {
      case "price-low-high":
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-high-low":
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "newest":
        // This would normally use createdAt, but our schema doesn't have it
        return b.id - a.id;
      default: // featured or any other case
        return b.featured ? 1 : -1;
    }
  }) : [];
  
  // Handle color filter toggle
  const toggleColorFilter = (color: string) => {
    setFilters(prev => {
      if (prev.colors.includes(color)) {
        return { ...prev, colors: prev.colors.filter(c => c !== color) };
      } else {
        return { ...prev, colors: [...prev.colors, color] };
      }
    });
  };
  
  // Handle size filter toggle
  const toggleSizeFilter = (size: string) => {
    setFilters(prev => {
      if (prev.sizes.includes(size)) {
        return { ...prev, sizes: prev.sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-montserrat text-3xl font-light">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : "All Products"}
            </h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {sortedProducts?.length || 0} products
              </span>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="space-y-8">
              <div>
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="mb-4"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Price Range</h3>
                <Slider
                  defaultValue={[0, 200]}
                  min={0}
                  max={200}
                  step={10}
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Colors</h3>
                <div className="space-y-2">
                  {availableColors.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color.value}`}
                        checked={filters.colors.includes(color.value)}
                        onCheckedChange={() => toggleColorFilter(color.value)}
                      />
                      <Label htmlFor={`color-${color.value}`} className="text-sm">
                        {color.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={filters.sizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSizeFilter(size)}
                      className={filters.sizes.includes(size) ? "bg-accent text-accent-foreground" : ""}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setFilters({
                  priceRange: [0, 200],
                  search: "",
                  sortBy: "featured",
                  colors: [],
                  sizes: [],
                })}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
            
            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, index) => (
                    <div key={index} className="flex flex-col space-y-3">
                      <Skeleton className="h-[400px] w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <i className="ri-shopping-bag-line text-5xl text-muted mb-4"></i>
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground text-center">
                    Try changing your filters or search query to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
