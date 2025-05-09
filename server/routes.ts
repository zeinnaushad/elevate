import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  registerSchema,
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertReviewSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

const JWT_SECRET = process.env.JWT_SECRET || "elev8-secret-key";
const SALT_ROUNDS = 10;

// Middleware for authentication
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    
    req.user = user;
    next();
  });
};

// Middleware for admin access
const adminOnly = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: "user",
      });
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error registering user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const passwordMatch = await bcrypt.compare(validatedData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error logging in" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured, search, limit, offset } = req.query;
      
      const products = await storage.getProducts({
        category: category as string | undefined,
        featured: featured ? featured === "true" : undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.post("/api/products", authenticateToken, adminOnly, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.put("/api/products/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      
      const product = await storage.updateProduct(id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Cart routes
  app.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Check if the product exists
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if the item already exists in the cart
      const existingItem = await storage.getCartItemByUserAndProduct(
        req.user.id,
        validatedData.productId
      );
      
      if (existingItem) {
        // Update quantity instead of creating a new item
        const updatedItem = await storage.updateCartItem(existingItem.id, {
          quantity: existingItem.quantity + validatedData.quantity,
        });
        return res.json(updatedItem);
      }
      
      // Create new cart item
      const cartItem = await storage.createCartItem(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });

  app.put("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cartItem = await storage.getCartItem(id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this cart item" });
      }
      
      const validatedData = insertCartItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateCartItem(id, validatedData);
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cartItem = await storage.getCartItem(id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this cart item" });
      }
      
      await storage.deleteCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing item from cart" });
    }
  });

  app.delete("/api/cart", authenticateToken, async (req, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Order routes
  app.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      let orders;
      
      if (req.user.role === "admin") {
        // Admins can see all orders
        orders = await storage.getOrders();
      } else {
        // Regular users can only see their own orders
        orders = await storage.getOrders(req.user.id);
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the user is authorized to view this order
      if (req.user.role !== "admin" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(id);
      
      res.json({
        ...order,
        items: orderItems,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      // Validate order data
      const validatedOrderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Validate order items
      const orderItemsData = z.array(insertOrderItemSchema.omit({ orderId: true })).parse(req.body.items);
      
      // Create order
      const order = await storage.createOrder(validatedOrderData);
      
      // Create order items
      const orderItems = await Promise.all(
        orderItemsData.map(item =>
          storage.createOrderItem({
            ...item,
            orderId: order.id,
          })
        )
      );
      
      // Clear the user's cart after successful order
      await storage.clearCart(req.user.id);
      
      res.status(201).json({
        ...order,
        items: orderItems,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.put("/api/orders/:id/status", authenticateToken, adminOnly, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  // Review routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const reviews = await storage.getReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  app.post("/api/products/:id/reviews", authenticateToken, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
        productId,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      res.status(500).json({ message: "Error creating review" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
