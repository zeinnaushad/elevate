import { Link } from "wouter";
import { cn, formatPrice, truncateText } from "@/lib/utils";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: product.id,
      quantity: 1,
      size: product.sizes?.[0] || undefined,
      color: product.colors?.[0] || undefined
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Wishlist",
      description: "Feature coming soon!",
    });
  };
  
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Quick view",
      description: "Feature coming soon!",
    });
  };
  
  return (
    <div className={cn("product-card group", className)}>
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden mb-4">
          <img 
            src={product.imageUrls[0]} 
            alt={product.name} 
            className="w-full h-[400px] object-cover" 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
          <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="w-10 h-10 bg-card flex items-center justify-center text-foreground hover:text-accent transition-colors"
              onClick={handleWishlist}
            >
              <i className="ri-heart-line"></i>
            </button>
            <button 
              className="w-10 h-10 bg-card flex items-center justify-center text-foreground hover:text-accent transition-colors"
              onClick={handleQuickView}
            >
              <i className="ri-eye-line"></i>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-card py-3 px-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
            <button 
              className="w-full text-center text-foreground hover:text-accent font-montserrat uppercase text-sm tracking-wider transition-colors"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
          {product.discountPrice && (
            <div className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1">
              SALE
            </div>
          )}
          {product.featured && !product.discountPrice && (
            <div className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1">
              FEATURED
            </div>
          )}
        </div>
        <h3 className="font-montserrat text-lg font-medium text-foreground mb-1">
          {truncateText(product.name, 30)}
        </h3>
        <div className="flex justify-between items-center">
          <div>
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="text-accent font-medium">{formatPrice(product.discountPrice)}</span>
                <span className="text-muted line-through ml-2">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="text-accent font-medium">{formatPrice(product.price)}</span>
            )}
          </div>
          <div className="flex space-x-1">
            <i className="ri-star-fill text-accent"></i>
            <i className="ri-star-fill text-accent"></i>
            <i className="ri-star-fill text-accent"></i>
            <i className="ri-star-fill text-accent"></i>
            <i className="ri-star-half-line text-accent"></i>
          </div>
        </div>
      </Link>
    </div>
  );
}
