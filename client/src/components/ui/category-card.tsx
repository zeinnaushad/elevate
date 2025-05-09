import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
}

export function CategoryCard({ title, image, link, className }: CategoryCardProps) {
  return (
    <div className={cn("relative overflow-hidden group h-[400px]", className)}>
      <img 
        src={image} 
        alt={`${title} collection`} 
        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6 py-8 border border-foreground/40 backdrop-blur-sm bg-background/30 hover:bg-background/40 transition-colors">
          <h3 className="font-montserrat text-2xl font-light text-foreground mb-2">{title}</h3>
          <Link href={link} className="text-accent hover:text-accent/80 inline-flex items-center transition-colors">
            Shop Collection <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
