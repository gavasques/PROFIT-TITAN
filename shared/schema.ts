import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Amazon Seller Accounts
export const amazonAccounts = pgTable("amazon_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  marketplaceId: varchar("marketplace_id").notNull(), // e.g., "ATVPDKIKX0DER" for US
  sellerId: varchar("seller_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at"),
  // SP-API Credentials
  lwaAppId: varchar("lwa_app_id").notNull(),
  lwaClientSecret: text("lwa_client_secret").notNull(),
  awsAccessKey: varchar("aws_access_key").notNull(),
  awsSecretKey: text("aws_secret_key").notNull(),
  awsRole: text("aws_role").notNull(),
  region: varchar("region").notNull().default("na"), // na, eu, fe, br
  status: varchar("status").notNull().default("pending"), // pending, connected, error, disconnected
  lastSyncAt: timestamp("last_sync_at"),
  accountName: varchar("account_name").notNull(), // User-friendly name like "Amazon US", "Amazon BR"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products (internal catalog)
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  internalSku: varchar("internal_sku").notNull(), // Internal company SKU
  sku: varchar("sku").notNull(), // SKU that may match marketplace SKU
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"),
  brand: varchar("brand"),
  imageUrl: varchar("image_url"),
  weight: decimal("weight", { precision: 10, scale: 3 }),
  length: decimal("length", { precision: 10, scale: 2 }),
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Amazon Product Listings (product instances on each Amazon account)
export const amazonListings = pgTable("amazon_listings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  amazonAccountId: uuid("amazon_account_id").notNull().references(() => amazonAccounts.id, { onDelete: "cascade" }),
  asin: varchar("asin").notNull(),
  sku: varchar("sku").notNull(), // Amazon SKU
  status: varchar("status").notNull().default("active"), // active, inactive, suspended
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product Costs (versioned history)
export const productCosts = pgTable("product_costs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  effectiveDate: timestamp("effective_date").notNull(),
  endDate: timestamp("end_date"), // null for current cost
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  customsCost: decimal("customs_cost", { precision: 10, scale: 2 }).default("0"),
  storageCost: decimal("storage_cost", { precision: 10, scale: 2 }).default("0"),
  packagingCost: decimal("packaging_cost", { precision: 10, scale: 2 }).default("0"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales Orders
export const salesOrders = pgTable("sales_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  amazonAccountId: uuid("amazon_account_id").notNull().references(() => amazonAccounts.id, { onDelete: "cascade" }),
  amazonOrderId: varchar("amazon_order_id").notNull().unique(),
  orderDate: timestamp("order_date").notNull(),
  status: varchar("status").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  buyerEmail: varchar("buyer_email"),
  shippingAddress: text("shipping_address"),
  marketplace: varchar("marketplace"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales Order Items
export const salesOrderItems = pgTable("sales_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: uuid("sales_order_id").notNull().references(() => salesOrders.id, { onDelete: "cascade" }),
  asin: varchar("asin").notNull(),
  sku: varchar("sku").notNull(),
  title: varchar("title").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Transactions (Amazon fees and deductions)
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  amazonAccountId: uuid("amazon_account_id").notNull().references(() => amazonAccounts.id, { onDelete: "cascade" }),
  transactionType: varchar("transaction_type").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  orderId: varchar("order_id"),
  sku: varchar("sku"),
  description: text("description").notNull(),
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  amazonAccounts: many(amazonAccounts),
  products: many(products),
}));

export const amazonAccountsRelations = relations(amazonAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [amazonAccounts.userId],
    references: [users.id],
  }),
  listings: many(amazonListings),
  salesOrders: many(salesOrders),
  financialTransactions: many(financialTransactions),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  listings: many(amazonListings),
  costs: many(productCosts),
}));

export const amazonListingsRelations = relations(amazonListings, ({ one, many }) => ({
  product: one(products, {
    fields: [amazonListings.productId],
    references: [products.id],
  }),
  amazonAccount: one(amazonAccounts, {
    fields: [amazonListings.amazonAccountId],
    references: [amazonAccounts.id],
  }),
  salesOrderItems: many(salesOrderItems),
}));

export const productCostsRelations = relations(productCosts, ({ one }) => ({
  product: one(products, {
    fields: [productCosts.productId],
    references: [products.id],
  }),
  createdByUser: one(users, {
    fields: [productCosts.createdBy],
    references: [users.id],
  }),
}));

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  amazonAccount: one(amazonAccounts, {
    fields: [salesOrders.amazonAccountId],
    references: [amazonAccounts.id],
  }),
  items: many(salesOrderItems),
}));

export const salesOrderItemsRelations = relations(salesOrderItems, ({ one }) => ({
  salesOrder: one(salesOrders, {
    fields: [salesOrderItems.salesOrderId],
    references: [salesOrders.id],
  }),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  amazonAccount: one(amazonAccounts, {
    fields: [financialTransactions.amazonAccountId],
    references: [amazonAccounts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAmazonAccountSchema = createInsertSchema(amazonAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAmazonListingSchema = createInsertSchema(amazonListings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductCostSchema = createInsertSchema(productCosts).omit({ id: true, createdAt: true });
export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({ id: true, createdAt: true });
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAmazonAccount = z.infer<typeof insertAmazonAccountSchema>;
export type AmazonAccount = typeof amazonAccounts.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertAmazonListing = z.infer<typeof insertAmazonListingSchema>;
export type AmazonListing = typeof amazonListings.$inferSelect;
export type InsertProductCost = z.infer<typeof insertProductCostSchema>;
export type ProductCost = typeof productCosts.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;
export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
