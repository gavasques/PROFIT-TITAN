import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertAmazonAccountSchema,
  insertProductSchema,
  insertProductCostSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Amazon Accounts routes
  app.get("/api/amazon-accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getAmazonAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching Amazon accounts:", error);
      res.status(500).json({ message: "Failed to fetch Amazon accounts" });
    }
  });

  app.post("/api/amazon-accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accountData = insertAmazonAccountSchema.parse({
        ...req.body,
        userId,
      });
      
      const account = await storage.createAmazonAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating Amazon account:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid account data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create Amazon account" });
      }
    }
  });

  app.patch("/api/amazon-accounts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const account = await storage.updateAmazonAccount(id, updates);
      if (!account) {
        return res.status(404).json({ message: "Amazon account not found" });
      }
      
      res.json(account);
    } catch (error) {
      console.error("Error updating Amazon account:", error);
      res.status(500).json({ message: "Failed to update Amazon account" });
    }
  });

  app.delete("/api/amazon-accounts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAmazonAccount(id);
      
      if (!success) {
        return res.status(404).json({ message: "Amazon account not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting Amazon account:", error);
      res.status(500).json({ message: "Failed to delete Amazon account" });
    }
  });

  // Products routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const updates = req.body;
      
      const product = await storage.updateProduct(id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
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
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const amazonAccountId = req.query.amazonAccountId as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (!amazonAccountId) {
        return res.status(400).json({ message: "amazonAccountId is required" });
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
