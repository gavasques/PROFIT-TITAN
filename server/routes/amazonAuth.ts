import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";

export function registerAmazonAuthRoutes(app: Express) {
  // Start Amazon OAuth flow
  app.get('/api/amazon-auth/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId, region = 'na' } = req.query;
      
      if (!accountId) {
        return res.status(400).json({ message: "Account ID is required" });
      }
      
      // Generate state parameter for security
      const state = Buffer.from(JSON.stringify({
        userId,
        accountId,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(7)
      })).toString('base64');
      
      // Store state in session for validation
      req.session.amazonAuthState = state;
      
      // Get the appropriate Seller Central URL based on region
      const sellerCentralUrls: Record<string, string> = {
        'na': 'https://sellercentral.amazon.com',
        'eu': 'https://sellercentral.amazon.co.uk',
        'fe': 'https://sellercentral.amazon.co.jp',
        'br': 'https://sellercentral.amazon.com.br'
      };
      
      const baseUrl = sellerCentralUrls[region] || sellerCentralUrls['na'];
      
      // Get application ID from environment
      const applicationId = process.env.AMAZON_SP_API_APP_ID;
      
      if (!applicationId) {
        console.error('AMAZON_SP_API_APP_ID not configured');
        return res.status(500).json({ 
          message: "Amazon SP-API application not configured. Please set AMAZON_SP_API_APP_ID environment variable." 
        });
      }
      
      // Construct authorization URL with version=beta for draft apps
      const authUrl = `${baseUrl}/apps/authorize/consent?application_id=${applicationId}&state=${state}&version=beta`;
      
      console.log('Starting Amazon OAuth flow:', {
        userId,
        accountId,
        region,
        authUrl
      });
      
      res.json({ authUrl });
      
    } catch (error) {
      console.error("Error starting Amazon auth:", error);
      res.status(500).json({ 
        message: "Failed to start Amazon authorization",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Amazon OAuth callback
  app.get('/api/amazon-auth/callback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { state, spapi_oauth_code, selling_partner_id } = req.query;
      
      console.log('Amazon OAuth callback received:', {
        state: state ? 'present' : 'missing',
        code: spapi_oauth_code ? 'present' : 'missing',
        sellerId: selling_partner_id,
        fullUrl: req.originalUrl
      });
      
      // Validate state parameter
      if (!state || state !== req.session.amazonAuthState) {
        console.error('Invalid state parameter');
        return res.status(400).json({ message: "Invalid state parameter" });
      }
      
      // Clear state from session
      delete req.session.amazonAuthState;
      
      // Decode state to get account info
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      
      if (!spapi_oauth_code) {
        return res.status(400).json({ message: "Authorization code not provided" });
      }
      
      // Exchange authorization code for refresh token
      const tokenUrl = 'https://api.amazon.com/auth/o2/token';
      
      const tokenBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: spapi_oauth_code,
        client_id: process.env.AMAZON_LWA_APP_ID || '',
        client_secret: process.env.AMAZON_LWA_CLIENT_SECRET || ''
      });
      
      console.log('Exchanging authorization code for tokens...', {
        tokenUrl,
        clientId: process.env.AMAZON_LWA_APP_ID,
        hasClientSecret: !!process.env.AMAZON_LWA_CLIENT_SECRET,
        codeLength: spapi_oauth_code?.length
      });
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenBody
      });
      
      const responseText = await tokenResponse.text();
      console.log('Token response:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        headers: Object.fromEntries(tokenResponse.headers.entries()),
        body: responseText.substring(0, 500)
      });
      
      let tokenData;
      try {
        tokenData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse token response:', parseError);
        return res.status(500).json({ 
          message: "Invalid token response format",
          error: responseText.substring(0, 200)
        });
      }
      
      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', {
          status: tokenResponse.status,
          error: tokenData
        });
        return res.status(500).json({ 
          message: "Failed to exchange authorization code",
          error: tokenData,
          status: tokenResponse.status
        });
      }
      
      console.log('Successfully obtained refresh token');
      
      // Update Amazon account with new credentials
      await storage.updateAmazonAccount(stateData.accountId, {
        sellerId: selling_partner_id,
        refreshToken: tokenData.refresh_token,
        status: 'connected',
        lastSyncAt: new Date()
      });
      
      // Redirect to success page with account info
      res.redirect(`/?auth=success&account=${encodeURIComponent(stateData.accountId)}`);
      
    } catch (error) {
      console.error("Error handling Amazon callback:", error);
      res.status(500).json({ 
        message: "Failed to complete Amazon authorization",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get authorization status
  app.get('/api/amazon-auth/status/:accountId', isAuthenticated, async (req: any, res) => {
    try {
      const { accountId } = req.params;
      const userId = req.user.claims.sub;
      
      const account = await storage.getAmazonAccount(accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json({
        isAuthorized: !!account.refreshToken,
        status: account.status,
        sellerId: account.sellerId,
        lastSyncAt: account.lastSyncAt
      });
      
    } catch (error) {
      console.error("Error checking auth status:", error);
      res.status(500).json({ message: "Failed to check authorization status" });
    }
  });
  
  // Diagnostic endpoint
  app.get('/api/amazon-auth/diagnostic', async (req, res) => {
    try {
      const diagnostic = {
        timestamp: new Date().toISOString(),
        environment: {
          lwaAppId: process.env.AMAZON_LWA_APP_ID ? `${process.env.AMAZON_LWA_APP_ID.substring(0, 15)}...` : 'Not set',
          hasClientSecret: !!process.env.AMAZON_LWA_CLIENT_SECRET,
          spApiAppId: process.env.AMAZON_SP_API_APP_ID ? `${process.env.AMAZON_SP_API_APP_ID.substring(0, 15)}...` : 'Not set',
        },
        urls: {
          expectedRedirectUri: 'https://profit.guivasques.app/api/amazon-auth/callback',
          expectedAllowedOrigin: 'https://profit.guivasques.app',
          tokenEndpoint: 'https://api.amazon.com/auth/o2/token'
        },
        recommendations: [
          'Verify redirect URI is configured in Amazon Developer Console',
          'Check LWA Client ID and Client Secret are correct',
          'Ensure allowed origins include the production domain',
          'Confirm LWA app is enabled and published'
        ]
      };
      
      res.json(diagnostic);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to run diagnostic',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}