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
    
    // Initialize with women's products (first 7 images)
    this.createProduct({
      name: "Sweet Pink Flare Sleeve Dress",
      description: "This elegant dress features a flattering silhouette with delicate flare sleeves in a beautiful sweet pink. Perfect for special occasions.",
      price: 2499,
      category: "women",
      imageUrls: [
        "/attached_assets/Sweet Pink Flare Sleeve Dress.jpeg"
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Pink", "White"],
      featured: true,
      sku: "WD-F2023-001",
      material: "100% Polyester",
      tags: ["dress", "elegant", "flare sleeve"]
    });
    
    this.createProduct({
      name: "Pastel Blue Chiffon Dress",
      description: "Elegant pastel blue chiffon dress perfect for summer events and garden parties.",
      price: 2899,
      category: "women",
      imageUrls: [
        "/attached_assets/Pastel Blue Chiffon Dress.jpeg"
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue"],
      featured: true,
      sku: "WD-F2023-002",
      material: "100% Chiffon",
      tags: ["dress", "pastel", "summer"]
    });
    
    this.createProduct({
      name: "Off Shoulder Brown Full Sleeved Top",
      description: "Stylish off-shoulder top with full sleeves in rich brown, perfect for casual outings or date nights.",
      price: 1499,
      category: "women",
      imageUrls: [
        "/attached_assets/Off Shoulder Brown Full sleeved Top.jpeg"
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Brown"],
      featured: true,
      sku: "WT-F2023-003",
      material: "95% Cotton, 5% Elastane",
      tags: ["top", "casual", "off-shoulder"]
    });
    
    this.createProduct({
      name: "Turned Down Collar Fitted Top",
      description: "Classic fitted top with turned down collar, perfect for office wear or semi-formal occasions.",
      price: 1299,
      category: "women",
      imageUrls: [
        "/attached_assets/Turned down collar fitted top.jpeg"
      ],
      sizes: ["S", "M", "L"],
      colors: ["White"],
      featured: false,
      sku: "WT-F2023-004",
      material: "80% Cotton, 20% Polyester",
      tags: ["top", "formal", "office wear"]
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
      sku: "WT-F2023-005",
      material: "100% Cotton",
      tags: ["tee", "casual", "printed"]
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
      sku: "WD-F2023-006",
      material: "95% Cotton, 5% Elastane",
      tags: ["dress", "mini", "elegant"]
    });
    
    this.createProduct({
      name: "Hulianfu Chiffon Dress",
      description: "Beautiful chiffon dress with elegant flowing design, perfect for formal events and celebrations.",
      price: 3499,
      category: "women",
      imageUrls: [
        "/attached_assets/Hulianfu Chiffon Dress for Women.jpeg"
      ],
      sizes: ["S", "M", "L"],
      colors: ["Pink", "White"],
      featured: true,
      sku: "WD-F2023-007",
      material: "100% Chiffon",
      tags: ["dress", "chiffon", "formal"]
    });
    
    // Initialize with men's products (next 6 images)
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
      sku: "MT-F2023-008",
      material: "100% Cotton",
      tags: ["t-shirt", "vintage", "casual"]
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
      sku: "MS-F2023-009",
      material: "95% Cotton, 5% Elastane",
      tags: ["shirt", "long sleeve", "casual"]
    });
    
    this.createProduct({
      name: "Abercrombie Knit Polo Shirt",
      description: "Premium knit polo shirt with a comfortable fit and classic design.",
      price: 2499,
      discountPrice: 1999,
      category: "men",
      imageUrls: [
        "/attached_assets/Abercrombie's $50 Knit Polo Shirts Have No….jpeg"
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Navy", "Gray"],
      featured: true,
      sku: "MP-F2023-010",
      material: "100% Cotton Knit",
      tags: ["polo", "knit", "casual"]
    });
    
    this.createProduct({
      name: "Men's Designer Shirt",
      description: "Stylish men's designer shirt with attention to detail and premium quality fabric.",
      price: 2299,
      category: "men",
      imageUrls: [
        "/attached_assets/S7DlfM7D.jpeg"
      ],
      sizes: ["M", "L", "XL"],
      colors: ["White", "Black"],
      featured: false,
      sku: "MS-F2023-011",
      material: "100% Cotton",
      tags: ["shirt", "designer", "formal"]
    });
    
    this.createProduct({
      name: "Men's Summer Collection Shirt",
      description: "Light and breathable shirt perfect for summer, featuring a modern design.",
      price: 1599,
      category: "men",
      imageUrls: [
        "/attached_assets/SaQdaxhE.jpeg"
      ],
      sizes: ["S", "M", "L"],
      colors: ["Blue", "White"],
      featured: true,
      sku: "MS-F2023-012",
      material: "80% Cotton, 20% Linen",
      tags: ["shirt", "summer", "casual"]
    });
    
    this.createProduct({
      name: "Men's Casual Shirt",
      description: "Versatile casual shirt that can be dressed up or down for various occasions.",
      price: 1799,
      category: "men",
      imageUrls: [
        "/attached_assets/EHHiwRJk.jpeg"
      ],
      sizes: ["M", "L", "XL"],
      colors: ["Blue", "Gray"],
      featured: false,
      sku: "MS-F2023-013",
      material: "100% Cotton",
      tags: ["shirt", "casual", "versatile"]
    });
    
    // Initialize with accessories (remaining images)
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
      sku: "AC-F2023-014",
      material: "Oxidized Silver",
      tags: ["necklace", "silver", "jewelry"]
    });
    
    this.createProduct({
      name: "Antique Pendant Necklace",
      description: "Beautiful antique-style pendant necklace with intricate detailing.",
      price: 1499,
      category: "accessories",
      imageUrls: [
        "/attached_assets/Antique pendant necklace.jpeg"
      ],
      sizes: [],
      colors: ["Gold", "Bronze"],
      featured: true,
      sku: "AC-F2023-015",
      material: "Mixed Metal",
      tags: ["necklace", "pendant", "antique"]
    });
    
    this.createProduct({
      name: "Coquette Baby Pink Purse",
      description: "Adorable baby pink purse with coquette style, perfect for adding a feminine touch to any outfit.",
      price: 1999,
      category: "accessories",
      imageUrls: [
        "/attached_assets/Coquette Baby Pink purse.jpeg"
      ],
      sizes: [],
      colors: ["Pink"],
      featured: true,
      sku: "AC-F2023-016",
      material: "Vegan Leather",
      tags: ["purse", "pink", "coquette"]
    });
    
    this.createProduct({
      name: "Pretty Straps Accessory",
      description: "Versatile straps accessory that can be used to enhance various outfits and styles.",
      price: 899,
      category: "accessories",
      imageUrls: [
        "/attached_assets/Best Sellers – Pretty Straps™.jpeg"
      ],
      sizes: [],
      colors: ["Black", "White", "Pink"],
      featured: false,
      sku: "AC-F2023-017",
      material: "Mixed Materials",
      tags: ["straps", "accessory", "versatile"]
    });
    
    this.createProduct({
      name: "Designer Sunglasses",
      description: "Stylish designer sunglasses with UV protection and modern frame design.",
      price: 2499,
      discountPrice: 1999,
      category: "accessories",
      imageUrls: [
        "/attached_assets/MULTIOPTIC SUNGLASSES & EYEWEAR on Instagram….jpeg"
      ],
      sizes: [],
      colors: ["Black", "Brown"],
      featured: true,
      sku: "AC-F2023-018",
      material: "Metal Frame, Polarized Glass",
      tags: ["sunglasses", "eyewear", "designer"]
    });
    
    this.createProduct({
      name: "Classic Fashion Accessory",
      description: "Timeless classic accessory that complements various styles and outfits.",
      price: 1299,
      category: "accessories",
      imageUrls: [
        "/attached_assets/ge3QeqRu.jpeg"
      ],
      sizes: [],
      colors: ["Black", "Gold"],
      featured: false,
      sku: "AC-F2023-019",
      material: "Mixed Materials",
      tags: ["accessory", "classic", "fashion"]
    });
    
    this.createProduct({
      name: "SHEIN Designer Accessory",
      description: "Trendy designer accessory from SHEIN, perfect for completing your stylish look.",
      price: 999,
      category: "accessories",
      imageUrls: [
        "/attached_assets/[goods_name] _ SHEIN USA.jpeg"
      ],
      sizes: [],
      colors: ["Silver", "Gold"],
      featured: false,
      sku: "AC-F2023-020",
      material: "Mixed Materials",
      tags: ["accessory", "designer", "trendy"]
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
