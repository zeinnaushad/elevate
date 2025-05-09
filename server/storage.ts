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
    
    // Initialize with demo products
    this.createProduct({
      name: "Chiffon Flare Sleeve Dress",
      description: "This elegant dress features a flattering silhouette with delicate chiffon flare sleeves. Perfect for special occasions.",
      price: 89.99,
      category: "women",
      imageUrls: [
        "https://images.unsplash.com/photo-1580651315530-69c8e0026377?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80"
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Black", "White", "Beige"],
      featured: true,
      sku: "WD-F2023-001",
      material: "100% Polyester",
      tags: ["dress", "elegant", "chiffon"]
    });
    
    this.createProduct({
      name: "Retro Washed Printed T-Shirt",
      description: "Vintage-inspired printed t-shirt with a comfortable fit and distressed details for an authentic look.",
      price: 45.99,
      category: "men",
      imageUrls: [
        "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80"
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Gray", "Black", "White"],
      featured: true,
      sku: "MT-F2023-002",
      material: "100% Cotton",
      tags: ["t-shirt", "vintage", "casual"]
    });
    
    this.createProduct({
      name: "Off Shoulder Long Sleeve Top",
      description: "Stylish off-shoulder top with long sleeves, perfect for casual outings or date nights.",
      price: 59.99,
      category: "women",
      imageUrls: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80"
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Brown", "Black", "White"],
      featured: true,
      sku: "WT-F2023-003",
      material: "95% Cotton, 5% Elastane",
      tags: ["top", "casual", "trendy"]
    });
    
    this.createProduct({
      name: "Layered Silver Necklace",
      description: "Elegant layered silver necklace that adds sophistication to any outfit.",
      price: 35.99,
      category: "accessories",
      imageUrls: [
        "https://images.unsplash.com/photo-1611085583191-a3b181a88401?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80"
      ],
      sizes: [],
      colors: ["Silver"],
      featured: true,
      sku: "AC-F2023-004",
      material: "Sterling Silver",
      tags: ["necklace", "silver", "jewelry"]
    });
    
    this.createProduct({
      name: "Frilled Mini White Dress",
      description: "This elegant frilled mini dress features a flattering silhouette with delicate ruffles. Made from premium lightweight fabric for comfort and style. Perfect for special occasions or evening events.",
      price: 129.99,
      discountPrice: 109.99,
      category: "women",
      imageUrls: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000&q=80",
        "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
        "https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
        "https://images.unsplash.com/photo-1554141220-83411835a60b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80"
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["White", "Black", "Beige"],
      featured: true,
      sku: "WD-F2023-005",
      material: "95% Cotton, 5% Elastane",
      tags: ["dress", "mini", "elegant"]
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
