import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, truncateText } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

// Form schema for product creation and editing
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.coerce.number().positive("Discount price must be positive").optional(),
  category: z.enum(["women", "men", "accessories"], {
    required_error: "Please select a category",
  }),
  imageUrls: z.array(z.string().url("Must be a valid URL")).min(1, "At least one image is required"),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  material: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductFormValues> }) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    },
  });
  
  // Form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: undefined,
      category: "women",
      imageUrls: [""],
      sizes: [],
      colors: [],
      featured: false,
      inStock: true,
      sku: "",
      material: "",
      tags: [],
    },
  });
  
  const openCreateDialog = () => {
    setCurrentProduct(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      discountPrice: undefined,
      category: "women",
      imageUrls: [""],
      sizes: [],
      colors: [],
      featured: false,
      inStock: true,
      sku: "",
      material: "",
      tags: [],
    });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      category: product.category,
      imageUrls: product.imageUrls,
      sizes: product.sizes || [],
      colors: product.colors || [],
      featured: product.featured,
      inStock: product.inStock,
      sku: product.sku,
      material: product.material || "",
      tags: product.tags || [],
    });
    setIsDialogOpen(true);
  };
  
  const onSubmit = (data: ProductFormValues) => {
    if (currentProduct) {
      updateProductMutation.mutate({ id: currentProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };
  
  // Handle image URLs
  const addImageUrl = () => {
    const currentUrls = form.getValues("imageUrls") || [];
    form.setValue("imageUrls", [...currentUrls, ""]);
  };
  
  const removeImageUrl = (index: number) => {
    const currentUrls = form.getValues("imageUrls") || [];
    if (currentUrls.length > 1) {
      form.setValue(
        "imageUrls",
        currentUrls.filter((_, i) => i !== index)
      );
    }
  };
  
  // Handle sizes
  const availableSizes = ["XS", "S", "M", "L", "XL"];
  
  const toggleSize = (size: string) => {
    const currentSizes = form.getValues("sizes") || [];
    if (currentSizes.includes(size)) {
      form.setValue(
        "sizes",
        currentSizes.filter((s) => s !== size)
      );
    } else {
      form.setValue("sizes", [...currentSizes, size]);
    }
  };
  
  // Handle colors
  const availableColors = ["White", "Black", "Beige", "Brown", "Gray", "Silver"];
  
  const toggleColor = (color: string) => {
    const currentColors = form.getValues("colors") || [];
    if (currentColors.includes(color)) {
      form.setValue(
        "colors",
        currentColors.filter((c) => c !== color)
      );
    } else {
      form.setValue("colors", [...currentColors, color]);
    }
  };
  
  // Handle tags
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      const currentTags = form.getValues("tags") || [];
      
      if (newTag && !currentTags.includes(newTag)) {
        form.setValue("tags", [...currentTags, newTag]);
      }
      
      e.currentTarget.value = "";
    }
  };
  
  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };
  
  // Filter products based on search query and category
  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
      
    return matchesSearch && matchesCategory;
  });
  
  return (
    <AdminLayout title="Product Management">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={selectedCategory || ""}
            onValueChange={(value) => setSelectedCategory(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={openCreateDialog}>
            <i className="ri-add-line mr-2"></i>
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableCaption>
                {filteredProducts?.length
                  ? `A list of ${filteredProducts.length} products`
                  : "No products found"}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {product.imageUrls?.[0] && (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {truncateText(product.name, 30)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {truncateText(product.description, 40)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      {product.discountPrice ? (
                        <div>
                          <span className="text-accent font-medium">
                            {formatPrice(product.discountPrice)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through ml-1">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span>{formatPrice(product.price)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.inStock ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                      {product.featured && (
                        <Badge variant="outline" className="ml-2">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <i className="ri-edit-line mr-1"></i>
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <i className="ri-delete-bin-line mr-1"></i>
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"? This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProductMutation.mutate(product.id)}
                              >
                                {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredProducts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <div>
                        <i className="ri-search-line text-3xl text-muted-foreground"></i>
                        <p className="text-muted-foreground mt-2">
                          No products match your search criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Product Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {currentProduct
                ? "Update the product information below"
                : "Fill in the details to create a new product"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price*</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="discountPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Price</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty for no discount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="women">Women</SelectItem>
                              <SelectItem value="men">Men</SelectItem>
                              <SelectItem value="accessories">
                                Accessories
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator className="md:col-span-2" />
                
                {/* Images */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Product Images</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImageUrl}
                    >
                      <i className="ri-add-line mr-1"></i>
                      Add Image
                    </Button>
                  </div>
                  
                  {form.watch("imageUrls")?.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`imageUrls.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className={index !== 0 ? "sr-only" : ""}>
                              {index === 0 ? "Image URL*" : ""}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://example.com/image.jpg"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("imageUrls").length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="mt-auto"
                          onClick={() => removeImageUrl(index)}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Separator className="md:col-span-2" />
                
                {/* Variants */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sizes & Colors</h3>
                  
                  <div>
                    <FormLabel className="mb-2 block">Sizes</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={
                            form.watch("sizes")?.includes(size)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <FormLabel className="mb-2 block">Colors</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <Button
                          key={color}
                          type="button"
                          variant={
                            form.watch("colors")?.includes(color)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => toggleColor(color)}
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Info</h3>
                  
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <Input
                      placeholder="Type and press Enter to add tags"
                      onKeyDown={addTag}
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("tags")?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 group"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-muted-foreground hover:text-foreground focus:outline-none"
                          >
                            <i className="ri-close-line text-xs"></i>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Separator className="md:col-span-2" />
                
                {/* Status Toggles */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-medium">Product Status</h3>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2">
                          <FormLabel>In Stock</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2">
                          <FormLabel>Featured Product</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting ||
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                >
                  {form.formState.isSubmitting ||
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                    ? "Saving..."
                    : currentProduct
                    ? "Update Product"
                    : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
