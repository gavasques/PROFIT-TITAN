import SellingPartnerAPI from 'amazon-sp-api';
import { storage } from './storage';
import type { 
  AmazonAccount, 
  InsertProduct, 
  InsertAmazonListing, 
  InsertSalesOrder,
  InsertSalesOrderItem,
  InsertFinancialTransaction 
} from '@shared/schema';

export interface AmazonCredentials {
  refresh_token: string;
  lwa_app_id: string;
  lwa_client_secret: string;
  aws_access_key: string;
  aws_secret_key: string;
  aws_role: string;
  region: 'na' | 'eu' | 'fe' | 'br';
}

export class AmazonSPService {
  private spClients: Map<string, any> = new Map();

  private createClient(credentials: AmazonCredentials): any {
    // Map Brasil region correctly - Brazil uses 'na' region with different endpoint
    const apiRegion = credentials.region === 'br' ? 'na' : credentials.region;
    
    console.log(`🌎 Creating SP-API client for region: ${credentials.region} (mapped to: ${apiRegion})`);
    
    return new SellingPartnerAPI.SellingPartner({
      region: apiRegion,
      refresh_token: credentials.refresh_token,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: credentials.lwa_app_id,
        SELLING_PARTNER_APP_CLIENT_SECRET: credentials.lwa_client_secret,
        AWS_ACCESS_KEY: credentials.aws_access_key,
        AWS_SECRET_KEY: credentials.aws_secret_key,
        AWS_SELLING_PARTNER_ROLE: credentials.aws_role
      } as any,
      options: {
        auto_request_tokens: true,
        debug_log: process.env.NODE_ENV === 'development',
        use_sandbox: process.env.NODE_ENV === 'development' && process.env.AMAZON_USE_SANDBOX === 'true',
        endpoints_versions: {
          'catalog': '2022-04-01',
          'listings': '2021-08-01',
          'reports': 'v2021-06-30'
        }
      }
    });
  }

  async getClient(amazonAccountId: string): Promise<any> {
    if (this.spClients.has(amazonAccountId)) {
      return this.spClients.get(amazonAccountId)!;
    }

    // Get account credentials from database
    const account = await storage.getAmazonAccount(amazonAccountId);
    if (!account) {
      throw new Error('Amazon account not found');
    }

    // Check if access token is expired and refresh if needed
    if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
      console.log('🔄 Access token expired, refreshing...');
      const isRefreshed = await this.validateAccountCredentials(account);
      if (!isRefreshed) {
        throw new Error('Failed to refresh expired access token');
      }
      // Get updated account data after refresh
      const updatedAccount = await storage.getAmazonAccount(amazonAccountId);
      if (!updatedAccount) {
        throw new Error('Amazon account not found after refresh');
      }
      // Use updated account data
      Object.assign(account, updatedAccount);
    }

    const credentials: AmazonCredentials = {
      refresh_token: account.refreshToken,
      lwa_app_id: account.lwaAppId,
      lwa_client_secret: account.lwaClientSecret,
      aws_access_key: account.awsAccessKey,
      aws_secret_key: account.awsSecretKey,
      aws_role: account.awsRole,
      region: account.region as 'na' | 'eu' | 'fe' | 'br'
    };

    const client = this.createClient(credentials);
    this.spClients.set(amazonAccountId, client);
    return client;
  }

  async testConnection(amazonAccountId: string): Promise<boolean> {
    try {
      const client = await this.getClient(amazonAccountId);
      
      // Test connection by fetching marketplace participations
      const response = await client.callAPI({
        operation: 'getMarketplaceParticipations',
        endpoint: 'sellers'
      });

      return response.success;
    } catch (error) {
      console.error('Amazon SP-API connection test failed:', error);
      return false;
    }
  }

  async syncProducts(amazonAccountId: string, userId: string): Promise<{ existingCount: number, newCount: number, totalCount: number }> {
    try {
      const amazonAccount = await storage.getAmazonAccount(amazonAccountId);
      if (!amazonAccount) {
        throw new Error('Amazon account not found');
      }

      // Validate account credentials before proceeding
      console.log('🔐 Validating Amazon credentials...');
      try {
        const isValidCredentials = await this.validateAccountCredentials(amazonAccount);
        if (!isValidCredentials) {
          await storage.updateAmazonAccount(amazonAccountId, {
            status: 'authorization_error'
          });
          throw new Error('Credenciais Amazon inválidas ou expiradas. Reconecte sua conta.');
        }
        console.log('✅ Credentials validated successfully');
      } catch (credentialsError) {
        console.error('❌ Credential validation error:', credentialsError);
        await storage.updateAmazonAccount(amazonAccountId, {
          status: 'authorization_error'
        });
        throw new Error(`Erro na validação das credenciais: ${credentialsError instanceof Error ? credentialsError.message : 'Erro desconhecido'}`);
      }

      // Update refresh token if available in environment
      if (process.env.AMAZON_REFRESH_TOKEN && amazonAccount.refreshToken !== process.env.AMAZON_REFRESH_TOKEN) {
        await storage.updateAmazonAccount(amazonAccountId, {
          refreshToken: process.env.AMAZON_REFRESH_TOKEN
        });
        // Clear cached client to force recreation with new token
        this.spClients.delete(amazonAccountId);
      }

      try {
        const client = await this.getClient(amazonAccountId);
        
        // Get existing products from our database for this user
        const existingProducts = await storage.getProductsByUserId(userId);
        const existingSkus = new Set(existingProducts.map(p => p.sku));
        
        let existingCount = 0;
        let newCount = 0;
        
        // Get marketplace ID correctly
        const marketplaceId = await this.getMarketplaceId(amazonAccountId);
        
        // Try FBA Inventory API first (more reliable for active inventory)
        let items = [];
        
        try {
          console.log('📦 Trying FBA Inventory API...');
          const inventoryResponse = await client.callAPI({
            operation: 'getInventorySummaries',
            endpoint: 'fbaInventory',
            query: {
              details: true,
              granularityType: 'Marketplace',
              granularityId: marketplaceId,
              marketplaceIds: [marketplaceId]
            }
          });

          console.log('📊 Inventory API response:', {
            success: !!inventoryResponse.success,
            hasData: !!inventoryResponse.inventorySummaries,
            count: inventoryResponse.inventorySummaries?.length || 0
          });

          if (inventoryResponse.success && inventoryResponse.inventorySummaries) {
            console.log(`📦 Found ${inventoryResponse.inventorySummaries.length} inventory items`);
            items = inventoryResponse.inventorySummaries;
            
            for (const item of items) {
              try {
                const isExisting = await this.processInventoryItem(item, amazonAccountId, userId, existingSkus);
                if (isExisting) {
                  existingCount++;
                } else {
                  newCount++;
                }
              } catch (itemError) {
                console.error(`❌ Error processing inventory item ${item.sellerSku}:`, itemError);
              }
            }
          } else {
            throw new Error('FBA Inventory API returned no data or failed');
          }
        } catch (inventoryError) {
          console.log(`📦 FBA Inventory API failed: ${inventoryError instanceof Error ? inventoryError.message : 'Unknown error'}`);
          console.log('📦 Trying Listings API as fallback...');
          
          try {
            // Fallback to Listings Items API
            const sellerId = amazonAccount.sellerId || 'A2T1SY156TAAGD';
            console.log('📋 Using seller ID:', sellerId);
            console.log('📋 Using marketplace ID:', marketplaceId);
            
            const listingsResponse = await client.callAPI({
              operation: 'getListingsItems',
              endpoint: 'listingsItems',
              path: {
                sellerId: sellerId,
              },
              query: {
                marketplaceIds: [marketplaceId],
                pageSize: 20,
                includedData: 'summaries,attributes,issues,offers,fulfillmentAvailability'
              }
            });

            console.log('📊 Listings API response:', {
              success: !!listingsResponse.success,
              hasData: !!listingsResponse.items,
              count: listingsResponse.items?.length || 0
            });

            if (listingsResponse.success && listingsResponse.items) {
              console.log(`📦 Found ${listingsResponse.items.length} listing items`);
              items = listingsResponse.items;
              
              for (const item of items) {
                try {
                  const isExisting = await this.processListingItem(item, amazonAccountId, userId, existingSkus);
                  if (isExisting) {
                    existingCount++;
                  } else {
                    newCount++;
                  }
                } catch (itemError) {
                  console.error(`❌ Error processing listing item ${item.sku}:`, itemError);
                }
              }
            } else {
              throw new Error('Both FBA Inventory and Listings APIs failed to return data');
            }
          } catch (listingsError) {
            console.error('❌ Listings API also failed:', listingsError);
            throw new Error(`Falha ao buscar produtos: FBA Inventory (${inventoryError instanceof Error ? inventoryError.message : 'erro desconhecido'}) e Listings API (${listingsError instanceof Error ? listingsError.message : 'erro desconhecido'}) falharam`);
          }
        }

        // Update last sync time
        await storage.updateAmazonAccount(amazonAccountId, {
          lastSyncAt: new Date(),
          status: 'connected'
        });

        return {
          existingCount,
          newCount,
          totalCount: existingCount + newCount
        };

      } catch (apiError: any) {
        console.error('Amazon API Error:', apiError);
        
        // Update account status to reflect authorization issue
        await storage.updateAmazonAccount(amazonAccountId, {
          status: 'authorization_error',
          lastSyncAt: new Date()
        });
        
        throw new Error(`Erro de autorização Amazon: ${apiError.message || 'Token expirado ou inválido. Reconecte sua conta Amazon.'}`);
      }

    } catch (error) {
      console.error('Error syncing products:', error);
      await storage.updateAmazonAccount(amazonAccountId, {
        status: 'error',
        lastSyncAt: new Date()
      });
      throw error;
    }
  }

  // Process individual inventory item from FBA Inventory API
  private async processInventoryItem(
    item: any, 
    amazonAccountId: string, 
    userId: string, 
    existingSkus: Set<string>
  ): Promise<boolean> {
    try {
      const sku = item.sellerSku;
      const asin = item.asin;
      const fnSku = item.fnSku;
      const isExisting = existingSkus.has(sku);

      console.log(`📦 Processing inventory item: ${sku} (ASIN: ${asin})`);

      // Get product details from catalog API
      let productName = `Produto ${sku}`;
      let description = '';
      let imageUrl = null;

      try {
        const client = await this.getClient(amazonAccountId);
        const catalogResponse = await client.callAPI({
          operation: 'getCatalogItem',
          endpoint: 'catalogItems',
          path: {
            asin: asin
          },
          query: {
            marketplaceIds: [await this.getMarketplaceId(amazonAccountId)],
            includedData: ['attributes', 'images', 'salesRanks']
          }
        });

        if (catalogResponse && catalogResponse.attributes) {
          const attributes = catalogResponse.attributes;
          productName = attributes.item_name?.[0]?.value || 
                       attributes.title?.[0]?.value || 
                       productName;
          description = attributes.description?.[0]?.value || '';
          imageUrl = catalogResponse.images?.[0]?.images?.[0]?.link || null;
        }
      } catch (catalogError) {
        console.log(`Could not fetch catalog details for ASIN: ${asin}`);
      }

      if (isExisting) {
        // Update existing product
        const existingProduct = await storage.getProductBySku(sku, userId);
        if (existingProduct) {
          await storage.updateProduct(existingProduct.id, {
            name: productName,
            description,
            imageUrl
          });
          
          // Update Amazon listing
          await this.updateOrCreateAmazonListing(existingProduct.id, amazonAccountId, {
            asin,
            sellerSku: sku,
            condition: 'New',
            totalQuantity: item.totalQuantity || 0
          });
        }
        return true;
      } else {
        // Create new product
        const newProduct = await storage.createProduct({
          userId,
          sku: sku,
          internalSku: sku,
          name: productName,
          description,
          category: 'Importado da Amazon',
          imageUrl
        });

        // Create Amazon listing
        await this.updateOrCreateAmazonListing(newProduct.id, amazonAccountId, {
          asin,
          sellerSku: sku,
          condition: 'New',
          totalQuantity: item.totalQuantity || 0
        });

        return false;
      }
    } catch (error) {
      console.error('Error processing inventory item:', error);
      return false;
    }
  }

  // Process individual listing item and create/update products
  private async processListingItem(
    item: any, 
    amazonAccountId: string, 
    userId: string, 
    existingSkus: Set<string>
  ): Promise<boolean> {
    const sku = item.sku;
    const asin = item.asin;
    const isExisting = existingSkus.has(sku);

    // Extract product name from summaries or attributes
    let productName = `Produto ${sku}`;
    if (item.summaries && item.summaries.length > 0) {
      const summary = item.summaries[0];
      if (summary.itemName) {
        productName = summary.itemName;
      }
    }

    // Extract current price from offers
    let currentPrice = '0.00';
    if (item.summaries && item.summaries.length > 0) {
      const summary = item.summaries[0];
      if (summary.buyBoxPrices && summary.buyBoxPrices.length > 0) {
        const price = summary.buyBoxPrices[0];
        if (price.listingPrice) {
          currentPrice = price.listingPrice.amount.toString();
        }
      }
    }

    if (isExisting) {
      // Update existing product
      const existingProduct = await storage.getProductBySku(sku, userId);
      if (existingProduct) {
        await storage.updateProduct(existingProduct.id, {
          name: productName
        });
      }
      return true;
    } else {
      // Create new product
      const newProduct = await storage.createProduct({
        userId,
        sku: sku,
        internalSku: sku,
        name: productName,
        category: 'Importado da Amazon',
        description: `Produto importado da Amazon - ASIN: ${asin}`
      });

      // Create Amazon listing
      await storage.createAmazonListing({
        productId: newProduct.id,
        amazonAccountId,
        asin: asin,
        sku: sku,
        status: item.status || 'Active',
        currentPrice: currentPrice,
        lastSyncAt: new Date()
      });

      return false;
    }
  }



  async syncOrders(amazonAccountId: string): Promise<void> {
    try {
      const client = await this.getClient(amazonAccountId);
      const marketplaceIds = await this.getMarketplaceIds(amazonAccountId);
      
      // Get orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const ordersResponse = await client.callAPI({
        operation: 'getOrders',
        endpoint: 'orders',
        query: {
          MarketplaceIds: marketplaceIds,
          CreatedAfter: thirtyDaysAgo.toISOString(),
          OrderStatuses: ['Shipped', 'Delivered']
        }
      });

      if (ordersResponse.success && ordersResponse.result) {
        const orders = ordersResponse.result.Orders || [];
        
        for (const order of orders) {
          await this.processOrder(order, amazonAccountId);
        }
      }

    } catch (error) {
      console.error('Error syncing orders:', error);
      throw error;
    }
  }

  async syncFinancialData(amazonAccountId: string): Promise<void> {
    try {
      const client = await this.getClient(amazonAccountId);
      
      // Get financial events from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const financialResponse = await client.callAPI({
        operation: 'listFinancialEvents',
        endpoint: 'finances',
        query: {
          PostedAfter: thirtyDaysAgo.toISOString()
        }
      });

      if (financialResponse.success && financialResponse.result) {
        const events = financialResponse.result.FinancialEvents || {};
        
        // Process different types of financial events
        if (events.ShipmentEventList) {
          for (const event of events.ShipmentEventList) {
            await this.processFinancialEvent(event, amazonAccountId, 'shipment');
          }
        }

        if (events.RefundEventList) {
          for (const event of events.RefundEventList) {
            await this.processFinancialEvent(event, amazonAccountId, 'refund');
          }
        }

        if (events.ServiceFeeEventList) {
          for (const event of events.ServiceFeeEventList) {
            await this.processFinancialEvent(event, amazonAccountId, 'service_fee');
          }
        }
      }

    } catch (error) {
      console.error('Error syncing financial data:', error);
      throw error;
    }
  }

  private async processProductWithMatch(item: any, amazonAccountId: string, userId: string, existingSkus: Set<string>): Promise<boolean> {
    try {
      // Extract product information from inventory item
      const sku = item.sellerSku;
      const asin = item.asin;
      const fnSku = item.fnSku;
      
      // Check if product already exists by SKU
      const isExisting = existingSkus.has(sku);
      
      if (isExisting) {
        // Update existing Amazon listing
        const existingProduct = await storage.getProductBySku(sku, userId);
        if (existingProduct) {
          await this.updateOrCreateAmazonListing(existingProduct.id, amazonAccountId, item);
        }
        return true;
      } else {
        // Create new product
        await this.createNewProductFromInventory(item, amazonAccountId, userId);
        return false;
      }

    } catch (error) {
      console.error('Error processing product with match:', error);
      return false;
    }
  }

  private async createNewProductFromInventory(item: any, amazonAccountId: string, userId: string): Promise<void> {
    const sku = item.sellerSku;
    const asin = item.asin;
    
    // Get product details from catalog API using ASIN
    let productName = `Produto ${sku}`;
    let description = '';
    let imageUrl = null;
    
    try {
      const client = await this.getClient(amazonAccountId);
      const catalogResponse = await client.callAPI({
        operation: 'getCatalogItem',
        endpoint: 'catalogItems',
        path: {
          asin: asin
        },
        query: {
          marketplaceIds: [await this.getMarketplaceId(amazonAccountId)],
          includedData: ['attributes', 'images']
        }
      });

      if (catalogResponse.success && catalogResponse.result) {
        const catalogItem = catalogResponse.result;
        const attributes = catalogItem.attributes || {};
        productName = attributes.item_name?.[0]?.value || 
                     attributes.title?.[0]?.value || 
                     productName;
        description = attributes.description?.[0]?.value || '';
        imageUrl = catalogItem.images?.[0]?.link || null;
      }
    } catch (error) {
      console.log('Could not fetch catalog details for ASIN:', asin);
    }

    // Create product in our database
    const productData: InsertProduct = {
      userId,
      internalSku: sku, // Use Amazon SKU as initial internal SKU
      name: productName,
      sku: sku,
      description,
      category: 'Importado da Amazon',
      imageUrl
    };

    const product = await storage.createProduct(productData);

    // Create Amazon listing
    await this.updateOrCreateAmazonListing(product.id, amazonAccountId, item);
  }

  private async updateOrCreateAmazonListing(productId: string, amazonAccountId: string, item: any): Promise<void> {
    const listingData: InsertAmazonListing = {
      productId,
      amazonAccountId,
      asin: item.asin,
      sku: item.sellerSku,
      status: item.condition || 'active',
      currentPrice: null, // Will be updated from pricing API
      imageUrl: null, // Will be updated from catalog API
      lastSyncAt: new Date()
    };

    // Check if listing already exists
    const existingListing = await storage.getAmazonListingBySkuAndAccount(item.sellerSku, amazonAccountId);
    
    if (existingListing) {
      await storage.updateAmazonListing(existingListing.id, {
        lastSyncAt: new Date(),
        status: item.condition || 'active'
      });
    } else {
      await storage.createAmazonListing(listingData);
    }
  }

  private async processOrder(order: any, amazonAccountId: string): Promise<void> {
    try {
      const orderData: InsertSalesOrder = {
        amazonAccountId,
        amazonOrderId: order.AmazonOrderId,
        orderDate: new Date(order.PurchaseDate),
        status: order.OrderStatus,
        totalAmount: parseFloat(order.OrderTotal?.Amount || '0').toString(),
        currency: order.OrderTotal?.CurrencyCode || 'USD',
        buyerEmail: order.BuyerInfo?.BuyerEmail || null,
        shippingAddress: JSON.stringify(order.ShippingAddress || {}),
        marketplace: order.MarketplaceId
      };

      const salesOrder = await storage.createSalesOrder(orderData);

      // Get order items
      const client = await this.getClient(amazonAccountId);
      const itemsResponse = await client.callAPI({
        operation: 'getOrderItems',
        endpoint: 'orders',
        path: {
          orderId: order.AmazonOrderId
        }
      });

      if (itemsResponse.success && itemsResponse.result) {
        const items = itemsResponse.result.OrderItems || [];
        
        for (const item of items) {
          const itemData: InsertSalesOrderItem = {
            salesOrderId: salesOrder.id,
            asin: item.ASIN,
            sku: item.SellerSKU,
            title: item.Title,
            quantity: parseInt(item.QuantityOrdered),
            unitPrice: parseFloat(item.ItemPrice?.Amount || '0').toString(),
            totalPrice: (parseFloat(item.ItemPrice?.Amount || '0') * parseInt(item.QuantityOrdered)).toString(),
            currency: item.ItemPrice?.CurrencyCode || 'USD'
          };

          await storage.createSalesOrderItem(itemData);
        }
      }

    } catch (error) {
      console.error('Error processing order:', error);
    }
  }

  private async processFinancialEvent(event: any, amazonAccountId: string, eventType: string): Promise<void> {
    try {
      const transactionData: InsertFinancialTransaction = {
        amazonAccountId,
        transactionType: eventType,
        transactionDate: new Date(event.PostedDate || new Date()),
        orderId: event.AmazonOrderId || null,
        sku: event.SellerSKU || null,
        description: this.getTransactionDescription(event, eventType),
        grossAmount: this.calculateGrossAmount(event).toString(),
        feeAmount: this.calculateFeeAmount(event).toString(),
        netAmount: this.calculateNetAmount(event).toString(),
        currency: event.ChargeList?.[0]?.ChargeAmount?.CurrencyCode || 'USD',
        details: JSON.stringify(event)
      };

      await storage.createFinancialTransaction(transactionData);

    } catch (error) {
      console.error('Error processing financial event:', error);
    }
  }

  private getTransactionDescription(event: any, eventType: string): string {
    switch (eventType) {
      case 'shipment':
        return `Shipment for order ${event.AmazonOrderId}`;
      case 'refund':
        return `Refund for order ${event.AmazonOrderId}`;
      case 'service_fee':
        return `Service fee: ${event.FeeDescription || 'Unknown'}`;
      default:
        return `${eventType} transaction`;
    }
  }

  private calculateGrossAmount(event: any): number {
    const charges = event.ChargeList || [];
    return charges.reduce((total: number, charge: any) => {
      const amount = parseFloat(charge.ChargeAmount?.Amount || '0');
      return charge.ChargeType === 'Principal' ? total + amount : total;
    }, 0);
  }

  private calculateFeeAmount(event: any): number {
    const charges = event.ChargeList || [];
    return charges.reduce((total: number, charge: any) => {
      const amount = parseFloat(charge.ChargeAmount?.Amount || '0');
      return charge.ChargeType !== 'Principal' ? total + Math.abs(amount) : total;
    }, 0);
  }

  private calculateNetAmount(event: any): number {
    const charges = event.ChargeList || [];
    return charges.reduce((total: number, charge: any) => {
      const amount = parseFloat(charge.ChargeAmount?.Amount || '0');
      return total + amount;
    }, 0);
  }

  private async getMarketplaceId(amazonAccountId: string): Promise<string> {
    const account = await storage.getAmazonAccount(amazonAccountId);
    return account?.marketplaceId || 'A2Q3Y263D00KWC'; // Default to BR marketplace
  }

  private async getMarketplaceIds(amazonAccountId: string): Promise<string[]> {
    const account = await storage.getAmazonAccount(amazonAccountId);
    if (!account) {
      throw new Error('Amazon account not found');
    }

    // Default marketplace IDs by region
    const marketplaceMap = {
      'na': ['ATVPDKIKX0DER'], // US
      'eu': ['A1PA6795UKMFR9'], // DE  
      'fe': ['A1VC38T7YXB528'], // JP
      'br': ['A2Q3Y263D00KWC']  // BR
    };

    return marketplaceMap[account.region as keyof typeof marketplaceMap] || [account.marketplaceId];
  }

  // Method to validate Amazon credentials
  async validateCredentials(credentials: AmazonCredentials): Promise<boolean> {
    try {
      const client = this.createClient(credentials);
      
      const response = await client.callAPI({
        operation: 'getMarketplaceParticipations',
        endpoint: 'sellers'
      });

      return response.success;
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }

  // Validate account credentials with token refresh check
  async validateAccountCredentials(account: AmazonAccount): Promise<boolean> {
    try {
      console.log(`🔍 Validating credentials for account: ${account.accountName}`);
      
      // Check if required fields are present
      if (!account.refreshToken || !account.lwaAppId || !account.lwaClientSecret) {
        console.error('❌ Missing required credentials');
        return false;
      }
      
      // First, try to get a fresh access token
      const tokenUrl = 'https://api.amazon.com/auth/o2/token';
      
      const tokenBody = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.refreshToken,
        client_id: account.lwaAppId,
        client_secret: account.lwaClientSecret
      });
      
      console.log(`🔄 Testing token refresh for client: ${account.lwaAppId.substring(0, 10)}...`);
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ProfitHub/1.0'
        },
        body: tokenBody,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`❌ Token refresh failed: ${tokenResponse.status} - ${errorText}`);
        return false;
      }
      
      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        console.error('❌ No access token received');
        return false;
      }
      
      console.log('✅ Token refresh successful');
      
      // Store the new access token temporarily for validation
      await storage.updateAmazonAccount(account.id, {
        accessToken: tokenData.access_token,
        tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
      });
      
      // Simple validation - just check if we can get marketplace participations
      try {
        const credentials: AmazonCredentials = {
          refresh_token: account.refreshToken,
          lwa_app_id: account.lwaAppId,
          lwa_client_secret: account.lwaClientSecret,
          aws_access_key: account.awsAccessKey,
          aws_secret_key: account.awsSecretKey,
          aws_role: account.awsRole,
          region: account.region as 'na' | 'eu' | 'fe' | 'br'
        };
        
        const isValid = await this.validateCredentials(credentials);
        console.log(`🔐 SP-API validation result: ${isValid}`);
        return isValid;
      } catch (spApiError) {
        console.error('❌ SP-API validation failed:', spApiError);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Account credential validation failed:', error);
      return false;
    }
  }
}

export const amazonSPService = new AmazonSPService();