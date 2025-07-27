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
      const accountData = {
        ...req.body,
        userId,
        status: 'pending'
      };

      // Validate the data
      const validatedData = insertAmazonAccountSchema.parse(accountData);

      // Test the connection before saving
      const isValid = await amazonSPService.validateCredentials({
        refresh_token: validatedData.refreshToken,
        lwa_app_id: validatedData.lwaAppId,
        lwa_client_secret: validatedData.lwaClientSecret,
        aws_access_key: validatedData.awsAccessKey,
        aws_secret_key: validatedData.awsSecretKey,
        aws_role: validatedData.awsRole,
        region: validatedData.region as 'na' | 'eu' | 'fe'
      });

      if (!isValid) {
        return res.status(400).json({ 
          message: "Invalid Amazon SP-API credentials. Please check your credentials and try again." 
        });
      }

      // Save account with connected status
      const account = await storage.createAmazonAccount({
        ...validatedData,
        status: 'connected'
      });

      // Start initial sync in background
      amazonSPService.syncProducts(account.id, userId).catch(error => {
        console.error("Initial sync failed:", error);
        storage.updateAmazonAccount(account.id, { 
          status: 'error', 
          lastSyncAt: new Date() 
        });
      });

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
      
      await amazonSPService.syncProducts(id, userId);
      res.json({ message: "Product sync completed successfully" });
    } catch (error) {
      console.error("Error syncing products:", error);
      res.status(500).json({ message: "Failed to sync products" });
    }
  });

  // Sync orders from Amazon
  app.post('/api/amazon-accounts/:id/sync-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await amazonSPService.syncOrders(id);
      res.json({ message: "Order sync completed successfully" });
    } catch (error) {
      console.error("Error syncing orders:", error);
      res.status(500).json({ message: "Failed to sync orders" });
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