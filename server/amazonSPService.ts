import * as SellingPartnerAPI from 'amazon-sp-api';
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
    return new (SellingPartnerAPI as any)({
      region: credentials.region,
      refresh_token: credentials.refresh_token,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: credentials.lwa_app_id,
        SELLING_PARTNER_APP_CLIENT_SECRET: credentials.lwa_client_secret,
        AWS_ACCESS_KEY_ID: credentials.aws_access_key,
        AWS_SECRET_ACCESS_KEY: credentials.aws_secret_key,
        AWS_SELLING_PARTNER_ROLE: credentials.aws_role
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

  async syncProducts(amazonAccountId: string, userId: string): Promise<void> {
    try {
      const client = await this.getClient(amazonAccountId);
      
      // Get catalog items (products)
      const catalogResponse = await client.callAPI({
        operation: 'getCatalogItem',
        endpoint: 'catalogItems',
        query: {
          marketplaceIds: await this.getMarketplaceIds(amazonAccountId),
          includedData: ['attributes', 'images', 'productTypes', 'relationships', 'salesRanks']
        }
      });

      if (catalogResponse.success && catalogResponse.result) {
        const items = catalogResponse.result.items || [];
        
        for (const item of items) {
          await this.processProduct(item, amazonAccountId, userId);
        }
      }

      // Update last sync time
      await storage.updateAmazonAccount(amazonAccountId, {
        lastSyncAt: new Date(),
        status: 'connected'
      });

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

  private async processProduct(item: any, amazonAccountId: string, userId: string): Promise<void> {
    try {
      // Extract product information
      const asin = item.asin;
      const attributes = item.attributes || {};
      const images = item.images || [];
      
      const title = attributes.item_name?.[0]?.value || 
                   attributes.title?.[0]?.value || 
                   'Unknown Product';

      // Create or update product in our database
      const productData: InsertProduct = {
        userId,
        name: title,
        sku: item.identifiers?.find((id: any) => id.identifierType === 'SKU')?.identifier || asin,
        description: attributes.description?.[0]?.value || '',
        category: attributes.item_type_name?.[0]?.value || 'General',
        imageUrl: images[0]?.link || null
      };

      const product = await storage.createProduct(productData);

      // Create Amazon listing
      const listingData: InsertAmazonListing = {
        productId: product.id,
        amazonAccountId,
        asin,
        sku: productData.sku,
        status: 'active',
        currentPrice: null, // Will be updated separately
        imageUrl: productData.imageUrl,
        lastSyncAt: new Date()
      };

      await storage.createAmazonListing(listingData);

    } catch (error) {
      console.error('Error processing product:', error);
      // Continue processing other products
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

  private async getMarketplaceIds(amazonAccountId: string): Promise<string[]> {
    const account = await storage.getAmazonAccount(amazonAccountId);
    if (!account) {
      throw new Error('Amazon account not found');
    }

    // Default marketplace IDs by region
    const marketplaceMap = {
      'na': ['ATVPDKIKX0DER'], // US
      'eu': ['A1PA6795UKMFR9'], // DE
      'fe': ['A1VC38T7YXB528']  // JP
    };

    return marketplaceMap[account.region as keyof typeof marketplaceMap] || marketplaceMap.na;
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