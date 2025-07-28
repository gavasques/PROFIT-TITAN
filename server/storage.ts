import {
  users,
  amazonAccounts,
  products,
  amazonListings,
  productCosts,
  salesOrders,
  salesOrderItems,
  financialTransactions,
  type User,
  type UpsertUser,
  type AmazonAccount,
  type InsertAmazonAccount,
  type Product,
  type InsertProduct,
  type AmazonListing,
  type InsertAmazonListing,
  type ProductCost,
  type InsertProductCost,
  type SalesOrder,
  type InsertSalesOrder,
  type SalesOrderItem,
  type InsertSalesOrderItem,
  type FinancialTransaction,
  type InsertFinancialTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, isNull, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Amazon Account operations
  getAmazonAccounts(userId: string): Promise<AmazonAccount[]>;
  getAmazonAccount(id: string): Promise<AmazonAccount | undefined>;
  createAmazonAccount(account: InsertAmazonAccount): Promise<AmazonAccount>;
  updateAmazonAccount(id: string, updates: Partial<InsertAmazonAccount>): Promise<AmazonAccount | undefined>;
  deleteAmazonAccount(id: string): Promise<boolean>;

  // Product operations
  getProducts(userId: string): Promise<Product[]>;
  getProductsByUserId(userId: string): Promise<Product[]>;
  getProductBySku(sku: string, userId: string): Promise<Product | undefined>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Amazon Listing operations
  getAmazonListings(userId: string, amazonAccountId?: string): Promise<AmazonListing[]>;
  getAmazonListingBySkuAndAccount(sku: string, amazonAccountId: string): Promise<AmazonListing | undefined>;
  createAmazonListing(listing: InsertAmazonListing): Promise<AmazonListing>;
  updateAmazonListing(id: string, updates: Partial<InsertAmazonListing>): Promise<AmazonListing | undefined>;

  // Product Cost operations
  getProductCosts(productId: string): Promise<ProductCost[]>;
  getCurrentProductCost(productId: string, date?: Date): Promise<ProductCost | undefined>;
  createProductCost(cost: InsertProductCost): Promise<ProductCost>;

  // Sales operations
  getSalesOrders(amazonAccountId: string, startDate?: Date, endDate?: Date): Promise<SalesOrder[]>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  getSalesOrderItems(salesOrderId: string): Promise<SalesOrderItem[]>;
  createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem>;

  // Financial operations
  getFinancialTransactions(amazonAccountId: string, startDate?: Date, endDate?: Date): Promise<FinancialTransaction[]>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;

  // Global operations
  getAllConnectedAmazonAccounts(): Promise<AmazonAccount[]>;

  // Analytics operations
  getDashboardKPIs(userId: string, startDate?: Date, endDate?: Date): Promise<{
    grossRevenue: number;
    netRevenue: number;
    totalProfit: number;
    averageMargin: number;
  }>;
  getTopProducts(userId: string, limit?: number): Promise<{
    product: Product;
    revenue: number;
    margin: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Amazon Account operations
  async getAmazonAccounts(userId: string): Promise<AmazonAccount[]> {
    return await db
      .select()
      .from(amazonAccounts)
      .where(eq(amazonAccounts.userId, userId))
      .orderBy(desc(amazonAccounts.createdAt));
  }

  async getAmazonAccount(id: string): Promise<AmazonAccount | undefined> {
    const [account] = await db
      .select()
      .from(amazonAccounts)
      .where(eq(amazonAccounts.id, id));
    return account;
  }

  async createAmazonAccount(account: InsertAmazonAccount): Promise<AmazonAccount> {
    const [newAccount] = await db
      .insert(amazonAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateAmazonAccount(id: string, updates: Partial<InsertAmazonAccount>): Promise<AmazonAccount | undefined> {
    const [updated] = await db
      .update(amazonAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(amazonAccounts.id, id))
      .returning();
    return updated;
  }

  async deleteAmazonAccount(id: string): Promise<boolean> {
    const result = await db
      .delete(amazonAccounts)
      .where(eq(amazonAccounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product operations
  async getProducts(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt));
  }

  async getProductsByUserId(userId: string): Promise<Product[]> {
    return this.getProducts(userId);
  }

  async getProductBySku(sku: string, userId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.sku, sku), eq(products.userId, userId)));
    return product;
  }

  async getProductsPaginated(
    userId: string, 
    page: number, 
    limit: number, 
    search?: string
  ): Promise<{ products: Product[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let baseConditions = [eq(products.userId, userId)];
    
    if (search) {
      baseConditions.push(
        or(
          sql`${products.name} ILIKE ${`%${search}%`}`,
          sql`${products.sku} ILIKE ${`%${search}%`}`,
          sql`${products.internalSku} ILIKE ${`%${search}%`}`
        )
      );
    }
    
    const productsList = await db
      .select()
      .from(products)
      .where(and(...baseConditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
    
    const [totalResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(and(...baseConditions));
    
    return {
      products: productsList,
      total: Number(totalResult?.count || 0)
    };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Amazon Listing operations
  async getAmazonListings(userId: string, amazonAccountId?: string): Promise<AmazonListing[]> {
    let conditions = [eq(products.userId, userId)];
    
    if (amazonAccountId) {
      conditions.push(eq(amazonListings.amazonAccountId, amazonAccountId));
    }

    return await db
      .select({
        id: amazonListings.id,
        productId: amazonListings.productId,
        amazonAccountId: amazonListings.amazonAccountId,
        asin: amazonListings.asin,
        sku: amazonListings.sku,
        status: amazonListings.status,
        currentPrice: amazonListings.currentPrice,
        imageUrl: amazonListings.imageUrl,
        lastSyncAt: amazonListings.lastSyncAt,
        createdAt: amazonListings.createdAt,
        updatedAt: amazonListings.updatedAt,
      })
      .from(amazonListings)
      .innerJoin(products, eq(amazonListings.productId, products.id))
      .where(and(...conditions))
      .orderBy(desc(amazonListings.createdAt));
  }

  async createAmazonListing(listing: InsertAmazonListing): Promise<AmazonListing> {
    const [newListing] = await db
      .insert(amazonListings)
      .values(listing)
      .returning();
    return newListing;
  }

  async getAmazonListingBySkuAndAccount(sku: string, amazonAccountId: string): Promise<AmazonListing | undefined> {
    const [listing] = await db
      .select()
      .from(amazonListings)
      .where(and(eq(amazonListings.sku, sku), eq(amazonListings.amazonAccountId, amazonAccountId)));
    return listing;
  }

  async updateAmazonListing(id: string, updates: Partial<InsertAmazonListing>): Promise<AmazonListing | undefined> {
    const [updated] = await db
      .update(amazonListings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(amazonListings.id, id))
      .returning();
    return updated;
  }

  // Product Cost operations
  async getProductCosts(productId: string): Promise<ProductCost[]> {
    return await db
      .select()
      .from(productCosts)
      .where(eq(productCosts.productId, productId))
      .orderBy(desc(productCosts.effectiveDate));
  }

  async getCurrentProductCost(productId: string, date: Date = new Date()): Promise<ProductCost | undefined> {
    const [cost] = await db
      .select()
      .from(productCosts)
      .where(
        and(
          eq(productCosts.productId, productId),
          lte(productCosts.effectiveDate, date),
          or(
            isNull(productCosts.endDate),
            gte(productCosts.endDate, date)
          )
        )
      )
      .orderBy(desc(productCosts.effectiveDate))
      .limit(1);
    return cost;
  }

  async createProductCost(cost: InsertProductCost): Promise<ProductCost> {
    // End previous cost version if it exists
    if (cost.effectiveDate) {
      await db
        .update(productCosts)
        .set({ endDate: cost.effectiveDate })
        .where(
          and(
            eq(productCosts.productId, cost.productId),
            isNull(productCosts.endDate)
          )
        );
    }

    const [newCost] = await db
      .insert(productCosts)
      .values(cost)
      .returning();
    return newCost;
  }

  // Sales operations
  async getSalesOrders(amazonAccountId: string, startDate?: Date, endDate?: Date): Promise<SalesOrder[]> {
    const conditions = [eq(salesOrders.amazonAccountId, amazonAccountId)];
    
    if (startDate) {
      conditions.push(gte(salesOrders.orderDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(salesOrders.orderDate, endDate));
    }

    return await db
      .select()
      .from(salesOrders)
      .where(and(...conditions))
      .orderBy(desc(salesOrders.orderDate));
  }

  async createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder> {
    const [newOrder] = await db
      .insert(salesOrders)
      .values(order)
      .returning();
    return newOrder;
  }

  async getSalesOrderItems(salesOrderId: string): Promise<SalesOrderItem[]> {
    return await db
      .select()
      .from(salesOrderItems)
      .where(eq(salesOrderItems.salesOrderId, salesOrderId));
  }

  async createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const [newItem] = await db
      .insert(salesOrderItems)
      .values(item)
      .returning();
    return newItem;
  }

  // Financial operations
  async getFinancialTransactions(amazonAccountId: string, startDate?: Date, endDate?: Date): Promise<FinancialTransaction[]> {
    const conditions = [eq(financialTransactions.amazonAccountId, amazonAccountId)];
    
    if (startDate) {
      conditions.push(gte(financialTransactions.transactionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(financialTransactions.transactionDate, endDate));
    }

    return await db
      .select()
      .from(financialTransactions)
      .where(and(...conditions))
      .orderBy(desc(financialTransactions.transactionDate));
  }

  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const [newTransaction] = await db
      .insert(financialTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // Global operations
  async getAllConnectedAmazonAccounts(): Promise<AmazonAccount[]> {
    return await db
      .select()
      .from(amazonAccounts)
      .where(eq(amazonAccounts.status, 'connected'))
      .orderBy(desc(amazonAccounts.lastSyncAt));
  }

  // Analytics operations
  async getDashboardKPIs(userId: string, startDate?: Date, endDate?: Date): Promise<{
    grossRevenue: number;
    netRevenue: number;
    totalProfit: number;
    averageMargin: number;
  }> {
    // This is a complex query that would need to join multiple tables
    // For now, returning mock data structure - implement with proper SQL aggregations
    return {
      grossRevenue: 0,
      netRevenue: 0,
      totalProfit: 0,
      averageMargin: 0,
    };
  }

  async getTopProducts(userId: string, limit: number = 10): Promise<{
    product: Product;
    revenue: number;
    margin: number;
  }[]> {
    // Complex query joining products with sales data
    // For now, returning empty array - implement with proper SQL aggregations
    return [];
  }
}

export const storage = new DatabaseStorage();
