import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { ProductQuantity } from "@/components/ui/product-quantity";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = parseInt(id || "0");
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  
  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Fetch product reviews
  const { data: reviews } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });
  
  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedColor && product.colors && product.colors.length > 0) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }
    
    addToCart({
      productId,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleAddToWishlist = () => {
    toast({
      title: "Feature coming soon",
      description: "Wishlist functionality is not yet implemented",
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Skeleton className="w-full h-[600px] mb-4" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-full h-24" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="w-3/4 h-10 mb-2" />
              <Skeleton className="w-1/4 h-6 mb-4" />
              <Skeleton className="w-1/3 h-8 mb-6" />
              <Skeleton className="w-full h-32 mb-8" />
              <Skeleton className="w-1/4 h-6 mb-2" />
              <div className="flex gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-10 h-10 rounded-md" />
                ))}
              </div>
              <Skeleton className="w-1/4 h-6 mb-2" />
              <div className="flex gap-3 mb-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
              </div>
              <div className="flex gap-4 mb-8">
                <Skeleton className="w-32 h-12" />
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <i className="ri-error-warning-line text-6xl text-accent mb-4"></i>
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  const discountPercentage = product.discountPrice
    ? calculateDiscountPercentage(product.price, product.discountPrice)
    : 0;
  
  const avgRating = reviews?.length 
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
    : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              {/* Main image */}
              <div className="mb-4 overflow-hidden">
                <img
                  src={product.imageUrls[activeImage]}
                  alt={`${product.name} - Main View`}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Thumbnail gallery */}
              {product.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.imageUrls.map((img, index) => (
                    <div
                      key={index}
                      className={`overflow-hidden border cursor-pointer ${
                        index === activeImage 
                          ? "border-accent" 
                          : "border-border opacity-70 hover:opacity-100 transition-opacity"
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="font-montserrat text-3xl font-light text-foreground mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <StarRating rating={avgRating} className="mr-4" />
                <span className="text-muted text-sm">
                  ({reviews?.length || 0} reviews)
                </span>
              </div>
              
              <div className="mb-6">
                {product.discountPrice ? (
                  <div className="flex items-center">
                    <span className="text-2xl text-accent font-medium">
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-muted line-through ml-2">
                      {formatPrice(product.price)}
                    </span>
                    <span className="ml-2 bg-accent/10 text-accent px-2 py-1 text-xs font-semibold rounded">
                      {discountPercentage}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl text-accent font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <p className="text-foreground/80 mb-8">
                {product.description}
              </p>
              
              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-montserrat uppercase text-sm tracking-wider mb-3">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <div key={size} className="relative">
                        <input
                          type="radio"
                          name="size"
                          id={`size-${size}`}
                          className="size-option sr-only"
                          checked={selectedSize === size}
                          onChange={() => setSelectedSize(size)}
                        />
                        <label
                          htmlFor={`size-${size}`}
                          className="w-10 h-10 flex items-center justify-center border border-border text-foreground hover:border-accent cursor-pointer"
                        >
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-accent mt-2">
                    <a href="#" className="underline hover:no-underline">Size Guide</a>
                  </p>
                </div>
              )}
              
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-montserrat uppercase text-sm tracking-wider mb-3">Color</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color) => {
                      // Convert color name to CSS color value
                      const colorMap: Record<string, string> = {
                        White: "#FFFFFF",
                        Black: "#000000",
                        Beige: "#E8DCCA",
                        Brown: "#964B00",
                        Gray: "#808080",
                        Silver: "#C0C0C0",
                      };
                      
                      const bgColor = colorMap[color] || "#CCCCCC";
                      
                      return (
                        <div key={color} className="relative">
                          <input
                            type="radio"
                            name="color"
                            id={`color-${color}`}
                            className="color-option sr-only"
                            checked={selectedColor === color}
                            onChange={() => setSelectedColor(color)}
                          />
                          <label
                            htmlFor={`color-${color}`}
                            className="w-8 h-8 rounded-full border border-border cursor-pointer"
                            style={{ backgroundColor: bgColor }}
                            title={color}
                          ></label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <ProductQuantity
                  value={quantity}
                  onChange={setQuantity}
                  className="w-32"
                />
                
                <Button 
                  className="flex-1 bg-accent text-accent-foreground font-montserrat font-medium py-3 hover:bg-accent/80"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 border-border flex items-center justify-center text-foreground hover:text-accent transition-colors"
                  onClick={handleAddToWishlist}
                >
                  <i className="ri-heart-line"></i>
                </Button>
              </div>
              
              {/* Product Details */}
              <div className="border-t border-border pt-6">
                <div className="flex flex-wrap gap-y-4">
                  <div className="w-full sm:w-1/2">
                    <p className="text-muted text-sm mb-1">SKU</p>
                    <p className="text-foreground">{product.sku}</p>
                  </div>
                  
                  <div className="w-full sm:w-1/2">
                    <p className="text-muted text-sm mb-1">Category</p>
                    <p className="text-foreground capitalize">{product.category}</p>
                  </div>
                  
                  {product.material && (
                    <div className="w-full sm:w-1/2">
                      <p className="text-muted text-sm mb-1">Material</p>
                      <p className="text-foreground">{product.material}</p>
                    </div>
                  )}
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="w-full sm:w-1/2">
                      <p className="text-muted text-sm mb-1">Tags</p>
                      <p className="text-foreground">{product.tags.join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="font-montserrat text-2xl font-light mb-8">
              Customer <span className="font-medium">Reviews</span>
            </h2>
            
            {reviews?.length > 0 ? (
              <div className="grid gap-6">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border border-border p-6 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">User #{review.userId}</h3>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    {review.comment && (
                      <p className="text-foreground/90">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center border border-border py-12 rounded-md">
                <i className="ri-chat-3-line text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
