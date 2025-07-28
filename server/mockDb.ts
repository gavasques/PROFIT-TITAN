// Mock database for local development
export class MockDatabase {
  private users: any[] = [];
  private amazonAccounts: any[] = [];
  private products: any[] = [];
  private amazonListings: any[] = [];

  constructor() {
    // Initialize with dev user and test Amazon account
    this.users = [{
      id: 'dev-user-123',
      email: 'dev@local.dev',
      firstName: 'Developer',
      lastName: 'Local',
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    this.amazonAccounts = [{
      id: 'test-account-1',
      userId: 'dev-user-123',
      name: 'Test Amazon Account',
      marketplace: 'US',
      sellerId: 'A123456789',
      refreshToken: 'test-refresh-token',
      accessToken: 'test-access-token',
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      status: 'connected',
      region: 'us-east-1',
      lastSyncAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    this.products = [{
      id: 'test-product-1',
      userId: 'dev-user-123',
      sku: 'TEST-SKU-001',
      name: 'Test Product',
      description: 'Mock product for testing',
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    this.amazonListings = [{
      id: 'test-listing-1',
      productId: 'test-product-1',
      amazonAccountId: 'test-account-1',
      asin: 'B0TEST123',
      sku: 'TEST-SKU-001',
      title: 'Test Product on Amazon',
      price: 29.99,
      currency: 'USD',
      quantity: 100,
      status: 'active',
      lastSyncAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }];
  }

  // Mock storage methods
  async upsertUser(userData: any) {
    const existingIndex = this.users.findIndex(u => u.id === userData.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...userData, updatedAt: new Date() };
    } else {
      this.users.push({ ...userData, createdAt: new Date(), updatedAt: new Date() });
    }
    return userData;
  }

  async getAmazonAccountsByUserId(userId: string) {
    return this.amazonAccounts.filter(acc => acc.userId === userId);
  }

  async getAmazonAccountById(id: string) {
    return this.amazonAccounts.find(acc => acc.id === id) || null;
  }

  async updateAmazonAccount(id: string, updates: any) {
    const index = this.amazonAccounts.findIndex(acc => acc.id === id);
    if (index >= 0) {
      this.amazonAccounts[index] = { ...this.amazonAccounts[index], ...updates, updatedAt: new Date() };
      return this.amazonAccounts[index];
    }
    return null;
  }

  async getAmazonListingsByAccountId(accountId: string) {
    return this.amazonListings.filter(listing => listing.amazonAccountId === accountId);
  }

  async upsertAmazonListing(listingData: any) {
    const existingIndex = this.amazonListings.findIndex(l => 
      l.amazonAccountId === listingData.amazonAccountId && l.sku === listingData.sku
    );
    
    if (existingIndex >= 0) {
      this.amazonListings[existingIndex] = { 
        ...this.amazonListings[existingIndex], 
        ...listingData, 
        updatedAt: new Date() 
      };
      return this.amazonListings[existingIndex];
    } else {
      const newListing = { 
        id: `mock-listing-${Date.now()}`,
        ...listingData, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      this.amazonListings.push(newListing);
      return newListing;
    }
  }
}

export const mockDb = new MockDatabase();