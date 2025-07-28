import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import authRoutes from "./routes/auth";
import { registerAmazonRoutes } from "./routes/amazon";
import { registerAmazonAuthRoutes } from "./routes/amazonAuth";
import { registerProductRoutes } from "./routes/products";
import { 
  insertAmazonAccountSchema,
  insertProductSchema,
  insertProductCostSchema,
} from "@shared/schema";
import { z } from "zod";
import { getUserId } from "./authUtils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Mount auth routes
  app.use('/api/auth', authRoutes);

  // Legacy auth route for compatibility
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register Amazon routes
  registerAmazonRoutes(app);
  registerAmazonAuthRoutes(app);
  registerProductRoutes(app);

  // Products routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;
      
      const { products, total } = await storage.getProductsPaginated(userId, page, limit, search);
      
      res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only access their own products
      if (product.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const productData = insertProductSchema.parse({
        ...req.body,
        userId,
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.patch("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const updates = req.body;
      
      // First check if product exists and belongs to user
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const product = await storage.updateProduct(id, updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      // First check if product exists and belongs to user
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Product Costs routes
  app.get("/api/products/:id/costs", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      // Verify user owns the product
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const costs = await storage.getProductCosts(id);
      res.json(costs);
    } catch (error) {
      console.error("Error fetching product costs:", error);
      res.status(500).json({ message: "Failed to fetch product costs" });
    }
  });

  app.get("/api/products/:id/costs/current", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      
      // Verify user owns the product
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const cost = await storage.getCurrentProductCost(id, date);
      
      if (!cost) {
        return res.status(404).json({ message: "No cost found for this product" });
      }
      
      res.json(cost);
    } catch (error) {
      console.error("Error fetching current product cost:", error);
      res.status(500).json({ message: "Failed to fetch current product cost" });
    }
  });

  app.post("/api/products/:id/costs", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      // Verify user owns the product
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const costData = insertProductCostSchema.parse({
        ...req.body,
        productId: id,
        createdBy: userId,
      });
      
      const cost = await storage.createProductCost(costData);
      res.status(201).json(cost);
    } catch (error) {
      console.error("Error creating product cost:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid cost data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product cost" });
      }
    }
  });

  // Amazon Listings routes
  app.get("/api/amazon-listings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const amazonAccountId = req.query.amazonAccountId as string;
      const listings = await storage.getAmazonListings(userId, amazonAccountId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching Amazon listings:", error);
      res.status(500).json({ message: "Failed to fetch Amazon listings" });
    }
  });

  // Dashboard analytics routes
  app.get("/api/dashboard/kpis", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const kpis = await storage.getDashboardKPIs(userId, startDate, endDate);
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching dashboard KPIs:", error);
      res.status(500).json({ message: "Failed to fetch dashboard KPIs" });
    }
  });

  app.get("/api/dashboard/top-products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const topProducts = await storage.getTopProducts(userId, limit);
      res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  // Sales routes
  app.get("/api/sales-orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const amazonAccountId = req.query.amazonAccountId as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (!amazonAccountId) {
        return res.status(400).json({ message: "amazonAccountId is required" });
      }
      
      // Verify user owns the Amazon account
      const amazonAccount = await storage.getAmazonAccount(amazonAccountId);
      if (!amazonAccount) {
        return res.status(404).json({ message: "Amazon account not found" });
      }
      
      if (amazonAccount.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const orders = await storage.getSalesOrders(amazonAccountId, startDate, endDate);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      res.status(500).json({ message: "Failed to fetch sales orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
