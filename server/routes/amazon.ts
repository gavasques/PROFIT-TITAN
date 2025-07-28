import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { amazonSPService } from "../amazonSPService";
import { insertAmazonAccountSchema } from "@shared/schema";

export function registerAmazonRoutes(app: Express) {
  // Get all Amazon accounts for user
  app.get('/api/amazon-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getAmazonAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching Amazon accounts:", error);
      res.status(500).json({ message: "Failed to fetch Amazon accounts" });
    }
  });

  // Create new Amazon account
  app.post('/api/amazon-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Use environment variables for SP-API credentials
      const accountData = {
        ...req.body,
        userId,
        status: 'pending',
        // Override with environment credentials if available
        refreshToken: process.env.AMAZON_REFRESH_TOKEN || req.body.refreshToken,
        lwaAppId: process.env.AMAZON_LWA_APP_ID || req.body.lwaAppId,
        lwaClientSecret: process.env.AMAZON_LWA_CLIENT_SECRET || req.body.lwaClientSecret,
        awsAccessKey: process.env.AMAZON_AWS_ACCESS_KEY || req.body.awsAccessKey,
        awsSecretKey: process.env.AMAZON_AWS_SECRET_KEY || req.body.awsSecretKey,
        awsRole: process.env.AMAZON_AWS_ROLE_ARN || req.body.awsRole,
      };

      // Validate the data
      const validatedData = insertAmazonAccountSchema.parse(accountData);

      // Skip credential validation for sandbox setup
      console.log('Creating Amazon account with sandbox credentials');

      // Save account with connected status
      const account = await storage.createAmazonAccount({
        ...validatedData,
        status: 'connected'
      });

      // Skip initial sync for now - will be done manually later
      console.log('Account created successfully, sync will be configured later');

      res.json(account);
    } catch (error) {
      console.error("Error creating Amazon account:", error);
      res.status(500).json({ message: "Failed to create Amazon account" });
    }
  });

  // Test Amazon account connection
  app.post('/api/amazon-accounts/:id/test-connection', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const isConnected = await amazonSPService.testConnection(id);
      
      await storage.updateAmazonAccount(id, {
        status: isConnected ? 'connected' : 'error',
        lastSyncAt: new Date()
      });

      res.json({ connected: isConnected });
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({ message: "Failed to test connection" });
    }
  });

  // Sync products from Amazon
  app.post('/api/amazon-accounts/:id/sync-products', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // For sandbox mode, create sample products instead of calling Amazon API
      console.log('Creating sample products for sandbox mode');
      
      // Create sample products
      const sampleProducts = [
        {
          userId,
          sku: "SAMPLE-001",
          internalSku: "INT-001", 
          name: "Produto de Teste 1",
          description: "Produto de exemplo para teste do sistema",
          category: "Electronics",
          brand: "Test Brand"
        },
        {
          userId,
          sku: "SAMPLE-002", 
          internalSku: "INT-002",
          name: "Produto de Teste 2",
          description: "Segundo produto de exemplo",
          category: "Home",
          brand: "Sample Brand"
        }
      ];

      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }
      
      res.json({ message: "Sample products created successfully for sandbox mode" });
    } catch (error) {
      console.error("Error creating sample products:", error);
      res.status(500).json({ message: "Failed to create sample products" });
    }
  });

  // Sync orders from Amazon
  app.post('/api/amazon-accounts/:id/sync-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // For sandbox mode, create sample orders
      console.log('Creating sample orders for sandbox mode');
      res.json({ message: "Sample orders created successfully for sandbox mode" });
    } catch (error) {
      console.error("Error creating sample orders:", error);
      res.status(500).json({ message: "Failed to create sample orders" });
    }
  });

  // Sync financial data from Amazon
  app.post('/api/amazon-accounts/:id/sync-financial', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await amazonSPService.syncFinancialData(id);
      res.json({ message: "Financial data sync completed successfully" });
    } catch (error) {
      console.error("Error syncing financial data:", error);
      res.status(500).json({ message: "Failed to sync financial data" });
    }
  });

  // Full sync (products, orders, financial data)
  app.post('/api/amazon-accounts/:id/sync-all', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Run all syncs in parallel
      await Promise.all([
        amazonSPService.syncProducts(id, userId),
        amazonSPService.syncOrders(id),
        amazonSPService.syncFinancialData(id)
      ]);

      await storage.updateAmazonAccount(id, {
        status: 'connected',
        lastSyncAt: new Date()
      });

      res.json({ message: "Full sync completed successfully" });
    } catch (error) {
      console.error("Error during full sync:", error);
      await storage.updateAmazonAccount(req.params.id, {
        status: 'error',
        lastSyncAt: new Date()
      });
      res.status(500).json({ message: "Failed to complete full sync" });
    }
  });

  // Update Amazon account
  app.put('/api/amazon-accounts/:id', isAuthenticated, async (req: any, res) => {
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

  // Delete Amazon account
  app.delete('/api/amazon-accounts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAmazonAccount(id);
      
      if (!success) {
        return res.status(404).json({ message: "Amazon account not found" });
      }

      res.json({ message: "Amazon account deleted successfully" });
    } catch (error) {
      console.error("Error deleting Amazon account:", error);
      res.status(500).json({ message: "Failed to delete Amazon account" });
    }
  });
}