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
    // Map Brasil region to na (North America) as the library doesn't support br directly
    const apiRegion = credentials.region === 'br' ? 'na' : credentials.region;
    
    return new SellingPartnerAPI.SellingPartner({
      region: apiRegion,
      refresh_token: credentials.refresh_token,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: credentials.lwa_app_id,
        SELLING_PARTNER_APP_CLIENT_SECRET: credentials.lwa_client_secret,
        AWS_ACCESS_KEY_ID: credentials.aws_access_key,
        AWS_SECRET_ACCESS_KEY: credentials.aws_secret_key,
        AWS_SELLING_PARTNER_ROLE: credentials.aws_role
      },
      sandbox: true // Enable sandbox mode for testing
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

    const credentials: AmazonCredentials = {
      refresh_token: account.refreshToken,
      lwa_app_id: account.lwaAppId,
      lwa_client_secret: account.lwaClientSecret,
      aws_access_key: account.awsAccessKey,
      aws_secret_key: account.awsSecretKey,
      aws_role: account.awsRole,
      region: account.region as 'na' | 'eu' | 'fe'
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
      const client = await this.getClient(amazonAccountId);
      
      // Get existing products from our database for this user
      const existingProducts = await storage.getProductsByUserId(userId);
      const existingSkus = new Set(existingProducts.map(p => p.sku));
      
      let existingCount = 0;
      let newCount = 0;
      
      // Get inventory items (this gives us the actual SKUs from seller's inventory)
      const inventoryResponse = await client.callAPI({
        operation: 'getInventorySummaries',
        endpoint: 'fbaInventory',
        query: {
          details: true,
          granularityType: 'Marketplace',
          granularityId: await this.getMarketplaceId(amazonAccountId),
          marketplaceIds: [await this.getMarketplaceId(amazonAccountId)]
        }
      });

      if (inventoryResponse.success && inventoryResponse.result) {
        const items = inventoryResponse.result.inventorySummaries || [];
        
        for (const item of items) {
          const isExisting = await this.processProductWithMatch(item, amazonAccountId, userId, existingSkus);
          if (isExisting) {
            existingCount++;
          } else {
            newCount++;
          }
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

    } catch (error) {
      console.error('Error syncing products:', error);
      await storage.updateAmazonAccount(amazonAccountId, {
        status: 'error',
        lastSyncAt: new Date()
      });
      throw error;
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
}

export const amazonSPService = new AmazonSPService();