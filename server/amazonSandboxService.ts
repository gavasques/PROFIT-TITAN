import { storage } from './storage';
import type { AmazonAccount } from '@shared/schema';

export class AmazonSandboxService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private account: AmazonAccount) {}

  private getEndpoint(): string {
    // Sandbox endpoints by region
    const endpoints: Record<string, string> = {
      'na': 'sandbox.sellingpartnerapi-na.amazon.com',
      'eu': 'sandbox.sellingpartnerapi-eu.amazon.com',
      'fe': 'sandbox.sellingpartnerapi-fe.amazon.com',
      'br': 'sandbox.sellingpartnerapi-na.amazon.com', // Brazil uses NA endpoint
      'sandbox-na': 'sandbox.sellingpartnerapi-na.amazon.com'
    };
    
    return endpoints[this.account.region] || endpoints['na'];
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    console.log('Getting new access token for Amazon SP-API');
    
    // Get new access token
    const tokenUrl = 'https://api.amazon.com/auth/o2/token';
    
    const tokenBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.account.refreshToken,
      client_id: this.account.lwaAppId,
      client_secret: this.account.lwaClientSecret
    });
    
    console.log('Token request URL:', tokenUrl);
    console.log('Client ID:', this.account.lwaAppId);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenBody
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Failed to get access token:', response.status, responseText);
      throw new Error(`Failed to get access token: ${response.status} - ${responseText}`);
    }

    try {
      const data = JSON.parse(responseText);
      this.accessToken = data.access_token;
      // Token expires in 1 hour, set expiry to 55 minutes to be safe
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
      
      console.log('Successfully obtained access token');
      return data.access_token;
    } catch (error) {
      console.error('Failed to parse token response:', responseText);
      throw new Error('Invalid token response from Amazon');
    }
  }

  private async makeRequest(path: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const host = this.getEndpoint();
    const url = `https://${host}${path}`;
    const date = new Date().toISOString();
    
    // Get access token
    const accessToken = await this.getAccessToken();
    
    const headers: Record<string, string> = {
      'x-amz-access-token': accessToken,
      'x-amz-date': date,
      'Content-Type': 'application/json',
      'User-Agent': 'ProfitHub/1.0 (Language=JavaScript; Platform=Node.js)'
    };

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };

    console.log(`Making request to: ${url}`);
    console.log(`Headers:`, headers);
    
    const response = await fetch(url, options);
    
    // Get response as text first
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      console.error(`Response body: ${responseText.substring(0, 500)}`);
      throw new Error(`API request failed: ${response.status} - ${responseText.substring(0, 200)}`);
    }
    
    // Try to parse as JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Response text:', responseText.substring(0, 500));
      throw new Error(`Invalid JSON response from API: ${responseText.substring(0, 100)}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple API call
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getCatalogItem(asin: string, marketplaceIds: string[]) {
    try {
      const params = new URLSearchParams({
        marketplaceIds: marketplaceIds.join(','),
        includedData: 'summaries,images,salesRanks'
      });
      
      const response = await this.makeRequest(
        `/catalog/2022-04-01/items/${asin}?${params.toString()}`,
        'GET'
      );
      
      return response;
    } catch (error) {
      console.error(`Error getting catalog item ${asin}:`, error);
      // Return null instead of throwing to handle missing items gracefully
      return null;
    }
  }

  async searchCatalogItems(keywords: string[], marketplaceIds: string[]) {
    try {
      const params = new URLSearchParams({
        keywords: keywords.join(','),
        marketplaceIds: marketplaceIds.join(','),
        includedData: 'summaries,images',
        pageSize: '20'
      });
      
      const response = await this.makeRequest(
        `/catalog/2022-04-01/items?${params.toString()}`,
        'GET'
      );
      
      return response;
    } catch (error) {
      console.error('Error searching catalog items:', error);
      throw error;
    }
  }
}