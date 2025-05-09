import { 
  users, User, InsertUser,
  products, Product, InsertProduct,
  cartItems, CartItem, InsertCartItem,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  reviews, Review, InsertReview
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(params?: { 
    category?: string, 
    featured?: boolean, 
    search?: string,
    limit?: number, 
    offset?: number 
  }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, cartItem: Partial<InsertCartItem>): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(userId?: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

// In-memory implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  currentUserId: number;
  currentProductId: number;
  currentCartItemId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentReviewId = 1;
    
    // Initialize with an admin user
    this.createUser({
      username: "admin",
      email: "admin@elev8.com",
      password: "$2b$10$1X7DXZ0PxiYgdY3dXzL9HO9g3z.tyVK3N.s.cMvF.5hLUx53zTpBi", // "admin123"
      role: "admin",
      firstName: "Admin",
      lastName: "User"
    });
    
    // WOMEN'S CATEGORY - FIRST 7 IMAGES ALPHABETICALLY
    this.createProduct({
      name: "Abercrombie Flare Sleeve Dress",
      description: "Elegant flare sleeve dress with a beautiful design and comfortable fit.",
      price: 2499,
      category: "women",
      imageUrls: [
        "/attached_assets/Abercrombie's $50 Knit Polo Shirts Have No….jpeg"
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Pink", "White"],
      featured: true,
      sku: "WD-F2023-001",
      material: "100% Polyester",
      tags: ["dress", "elegant", "flare sleeve"]
    });
    
    this.createProduct({
      name: "Antique Style Dress",
      description: "Beautiful vintage-inspired dress with antique detailing perfect for special occasions.",
      price: 2899,
      category: "women",
      imageUrls: [
        "/attached_assets/Antique pendant necklace.jpeg"
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Gold", "Bronze"],
      featured: true,
      sku: "WD-F2023-002",
      material: "Premium Blend",
      tags: ["dress", "vintage", "special occasion"]
    });
    
    this.createProduct({
      name: "Strappy Summer Dress",
      description: "Light and airy summer dress with pretty straps, perfect for warm weather occasions.",
      price: 1899,
      category: "women",
      imageUrls: [
        "/attached_assets/Best Sellers – Pretty Straps™.jpeg"
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Pink", "White"],
      featured: false,
      sku: "WD-F2023-003",
      material: "95% Cotton, 5% Elastane",
      tags: ["dress", "summer", "strappy"]
    });
    
    this.createProduct({
      name: "Blue Printed Baby Tee",
      description: "Cute blue printed baby tee with a comfortable fit, perfect for casual everyday wear.",
      price: 899,
      category: "women",
      imageUrls: [
        "/attached_assets/Blue printed baby tee.jpeg"
      ],
      sizes: ["XS", "S", "M"],
      colors: ["Blue"],
      featured: false,
      sku: "WT-F2023-004",
      material: "100% Cotton",
      tags: ["tee", "casual", "printed"]
    });
    
    this.createProduct({
      name: "Pink Coquette Dress",
      description: "Adorable pink coquette dress with feminine details, perfect for creating a sweet look.",
      price: 1999,
      category: "women",
      imageUrls: [
        "/attached_assets/Coquette Baby Pink purse.jpeg"
      ],
      sizes: ["XS", "S", "M"],
      colors: ["Pink"],
      featured: true,
      sku: "WD-F2023-005",
      material: "Premium Blend",
      tags: ["dress", "coquette", "pink"]
    });
    
    this.createProduct({
      name: "Contemporary Fashion Dress",
      description: "Modern dress with contemporary styling and premium design elements.",
      price: 1799,
      category: "women",
      imageUrls: [
        "/attached_assets/EHHiwRJk.jpeg"
      ],
      sizes: ["S", "M", "L"],
      colors: ["Blue", "Gray"],
      featured: false,
      sku: "WD-F2023-006",
      material: "Premium Blend",
      tags: ["dress", "contemporary", "premium"]
    });
    
    this.createProduct({
      name: "Frilled Mini White Dress",
      description: "This elegant frilled mini dress features a flattering silhouette with delicate ruffles. Made from premium lightweight fabric for comfort and style.",
      price: 3299,
      discountPrice: 2699,
      category: "women",
      imageUrls: [
        "/attached_assets/Frilled mini White Dress.jpeg"
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["White"],
      featured: true,
      sku: "WD-F2023-007",
      material: "95% Cotton, 5% Elastane",
      tags: ["dress", "mini", "elegant"]
    });
    
    // MEN'S CATEGORY - NEXT 7 IMAGES ALPHABETICALLY
    this.createProduct({
      name: "Designer Men's Fashion",
      description: "Premium designer men's fashion item with unique styling and high-quality construction.",
      price: 2299,
      category: "men",
      imageUrls: [
        "/attached_assets/ge3QeqRu.jpeg"
      ],
      sizes: ["M", "L", "XL"],
      colors: ["Black", "Gold"],
      featured: true,
      sku: "MF-F2023-008",
      material: "Premium Materials",
      tags: ["designer", "premium", "men's fashion"]
    });
    
    this.createProduct({
      name: "SHEIN Men's Collection",
      description: "Stylish item from the SHEIN men's collection featuring modern design elements.",
      price: 1599,
      category: "men",
      imageUrls: [
        "/attached_assets/[goods_name] _ SHEIN USA.jpeg"
      ],
      sizes: ["S", "M", "L"],
      colors: ["Black", "Silver"],
      featured: false,
      sku: "MC-F2023-009",
      material: "Premium Blend",
      tags: ["shein", "modern", "men's collection"]
    });
    
    this.createProduct({
      name: "Hulianfu Men's Shirt",
      description: "Stylish men's shirt from Hulianfu featuring excellent craftsmanship and premium fabric.",
      price: 1899,
      category: "men",
      imageUrls: [
        "/attached_assets/Hulianfu Chiffon Dress for Women.jpeg"
      ],
      sizes: ["M", "L", "XL"],
      colors: ["White", "Pink"],
      featured: true,
      sku: "MS-F2023-010",
      material: "Premium Fabric",
      tags: ["shirt", "premium", "hulianfu"]
    });
    
    this.createProduct({
      name: "Helix Black Long Sleeve Shirt",
      description: "Stylish black long sleeve shirt perfect for casual or semi-formal occasions.",
      price: 1799,
      category: "men",
      imageUrls: [
        "/attached_assets/I just added a new item to eBay, Helix Black Long….jpeg"
      ],
      sizes: ["M", "L", "XL"],
      colors: ["Black"],
      featured: false,
      sku: "MS-F2023-011",
      material: "95% Cotton, 5% Elastane",
      tags: ["shirt", "long sleeve", "casual"]
    });
    
    this.createProduct({
      name: "Retro Washed Printed T-Shirt",
      description: "Vintage-inspired printed t-shirt with a comfortable fit and distressed details for an authentic look.",
      price: 1299,
      category: "men",
      imageUrls: [
        "/attached_assets/Men_s Retro Washed Printed T-Shirt-Retro Washed….jpeg"
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Gray", "Black"],
      featured: true,
      sku: "MT-F2023-012",
      material: "100% Cotton",
      tags: ["t-shirt", "vintage", "casual"]
    });
    
    this.createProduct({
      name: "Designer Eyewear for Men",
      description: "High-quality designer eyewear for men with stylish frames and UV protection.",
      price: 2499,
      discountPrice: 1999,
      category: "men",
      imageUrls: [
        "/attached_assets/MULTIOPTIC SUNGLASSES & EYEWEAR on Instagram….jpeg"
      ],
      sizes: ["One Size"],
      colors: ["Black", "Brown"],
      featured: true,
      sku: "ME-F2023-013",
      material: "Premium Materials",
      tags: ["eyewear", "designer", "UV protection"]
    });
    
    this.createProduct({
      name: "Brown Casual Shirt",
      description: "Stylish brown casual shirt with a modern fit and comfortable design.",
      price: 1699,
      category: "men",
      imageUrls: [
        "/attached_assets/Off Shoulder Brown Full sleeved Top.jpeg"
      ],
      sizes: ["M", "L", "XL"],
      colors: ["Brown"],
      featured: false,
      sku: "MS-F2023-014",
      material: "95% Cotton, 5% Elastane",
      tags: ["shirt", "casual", "brown"]
    });
    
    // ACCESSORIES CATEGORY - REMAINING IMAGES
    this.createProduct({
      name: "Oxidized Silver Layered Necklace",
      description: "Elegant oxidized silver layered necklace that adds sophistication to any outfit.",
      price: 1299,
      category: "accessories",
      imageUrls: [
        "/attached_assets/Oxidized silver layered necklace.jpeg"
      ],
      sizes: [],
      colors: ["Silver"],
      featured: true,
      sku: "AC-F2023-015",
      material: "Oxidized Silver",
      tags: ["necklace", "silver", "jewelry"]
    });
    
    this.createProduct({
      name: "Pastel Blue Fashion Accessory",
      description: "Beautiful pastel blue accessory to complement your fashion style.",
      price: 999,
      category: "accessories",
      imageUrls: [
        "/attached_assets/Pastel Blue Chiffon Dress.jpeg"
      ],
      sizes: [],
      colors: ["Blue"],
      featured: false,
      sku: "AC-F2023-016",
      material: "Premium Materials",
      tags: ["accessory", "pastel", "blue"]
    });
    
    this.createProduct({
      name: "Designer Men's Accessory",
      description: "Stylish men's fashion accessory with premium design elements.",
      price: 1399,
      category: "accessories",
      imageUrls: [
        "/attached_assets/S7DlfM7D.jpeg"
      ],
      sizes: [],
      colors: ["Black", "White"],
      featured: true,
      sku: "AC-F2023-017",
      material: "Premium Materials",
      tags: ["accessory", "men's", "designer"]
    });
    
    this.createProduct({
      name: "Summer Collection Accessory",
      description: "Light and stylish accessory perfect for completing your summer looks.",
      price: 1199,
      category: "accessories",
      imageUrls: [
        "/attached_assets/SaQdaxhE.jpeg"
      ],
      sizes: [],
      colors: ["Blue", "White"],
      featured: false,
      sku: "AC-F2023-018",
      material: "Mixed Materials",
      tags: ["accessory", "summer", "stylish"]
    });
    
    this.createProduct({
      name: "Classic Fashion Scarf",
      description: "Elegant lightweight scarf in sweet pink design, perfect for any season.",
      price: 1499,
      category: "accessories",
      imageUrls: [
        "/attached_assets/Sweet Pink Flare Sleeve Dress.jpeg"
      ],
      sizes: [],
      colors: ["Pink"],
      featured: true,
      sku: "AC-F2023-019",
      material: "Premium Fabric",
      tags: ["scarf", "classic", "pink"]
    });
    
    this.createProduct({
      name: "Collar Fashion Accessory",
      description: "Stylish collar accessory to upgrade your outfit with a touch of elegance.",
      price: 899,
      category: "accessories",
      imageUrls: [
        "/attached_assets/Turned down collar fitted top.jpeg"
      ],
      sizes: [],
      colors: ["White"],
      featured: false,
      sku: "AC-F2023-020",
      material: "Premium Fabric",
      tags: ["collar", "accessory", "elegant"]
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(params?: { 
    category?: string, 
    featured?: boolean, 
    search?: string,
    limit?: number, 
    offset?: number 
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (params?.category) {
      products = products.filter(product => product.category === params.category);
    }
    
    if (params?.featured !== undefined) {
      products = products.filter(product => product.featured === params.featured);
    }
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    const offset = params?.offset || 0;
    const limit = params?.limit || products.length;
    
    return products.slice(offset, offset + limit);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
  }

  async createCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, cartItemData: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, ...cartItemData };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    for (const item of userCartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(userId?: number): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (userId !== undefined) {
      orders = orders.filter(order => order.userId === userId);
    }
    
    return orders;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status: status as Order['status'] };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Review methods
  async getReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const createdAt = new Date();
    const review: Review = { ...insertReview, id, createdAt };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
