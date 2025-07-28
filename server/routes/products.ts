import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { AmazonSPService } from "../amazonSPService";

const amazonSPService = new AmazonSPService();

export function registerProductRoutes(app: Express) {
  // Get all products for a user
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Sync products from Amazon account
  app.post('/api/products/sync/:amazonAccountId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amazonAccountId } = req.params;

      // Verify the Amazon account belongs to the user
      const amazonAccount = await storage.getAmazonAccount(amazonAccountId);
      if (!amazonAccount) {
        return res.status(404).json({ message: "Amazon account not found" });
      }

      if (amazonAccount.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Start product sync
      const syncResult = await amazonSPService.syncProducts(amazonAccountId, userId);

      res.json({
        success: true,
        message: `Sincronização concluída: ${syncResult.existingCount} produtos já existentes, ${syncResult.newCount} produtos novos adicionados`,
        data: syncResult
      });

    } catch (error) {
      console.error("Error syncing products:", error);
      res.status(500).json({ 
        success: false,
        message: "Erro ao sincronizar produtos",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create new product
  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productData = {
        ...req.body,
        userId
      };

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product
  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      // Verify product belongs to user
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateProduct(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product
  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      // Verify product belongs to user
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteProduct(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete product" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Link product SKU to Amazon listing
  app.post('/api/products/:productId/link-sku', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId } = req.params;
      const { sku, amazonAccountId } = req.body;

      // Verify product belongs to user
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify Amazon account belongs to user
      const amazonAccount = await storage.getAmazonAccount(amazonAccountId);
      if (!amazonAccount || amazonAccount.userId !== userId) {
        return res.status(403).json({ message: "Access denied to Amazon account" });
      }

      // Update product SKU to match Amazon SKU
      const updatedProduct = await storage.updateProduct(productId, { sku });

      res.json({
        success: true,
        message: `SKU vinculado com sucesso: ${sku}`,
        product: updatedProduct
      });

    } catch (error) {
      console.error("Error linking SKU:", error);
      res.status(500).json({ 
        success: false,
        message: "Erro ao vincular SKU",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}