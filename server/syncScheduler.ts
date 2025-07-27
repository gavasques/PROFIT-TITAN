import * as cron from 'node-cron';
import { storage } from './storage';
import { amazonSPService } from './amazonSPService';

class SyncScheduler {
  private syncJobs: Map<string, cron.ScheduledTask> = new Map();

  // Schedule automatic syncs for all connected Amazon accounts
  async scheduleAllSyncs() {
    console.log('Starting sync scheduler...');
    
    // Every hour: Sync orders and financial data for all connected accounts
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly sync for orders and financial data...');
      await this.syncAllConnectedAccounts(['orders', 'financial']);
    });

    // Every 6 hours: Full sync (products, orders, financial)
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running full sync for all connected accounts...');
      await this.syncAllConnectedAccounts(['products', 'orders', 'financial']);
    });

    // Daily at 2 AM: Complete sync with product updates
    cron.schedule('0 2 * * *', async () => {
      console.log('Running daily complete sync...');
      await this.syncAllConnectedAccounts(['products', 'orders', 'financial'], true);
    });

    console.log('Sync scheduler initialized');
  }

  private async syncAllConnectedAccounts(
    syncTypes: ('products' | 'orders' | 'financial')[],
    forceProductSync: boolean = false
  ) {
    try {
      // Get all users - we need to iterate through them to get their accounts
      // For now, we'll get all accounts with status 'connected'
      const allAccounts = await this.getAllConnectedAccounts();
      
      console.log(`Found ${allAccounts.length} connected accounts to sync`);

      for (const account of allAccounts) {
        try {
          console.log(`Starting sync for account ${account.accountName} (${account.id})`);
          
          const syncPromises: Promise<void>[] = [];

          if (syncTypes.includes('products')) {
            syncPromises.push(
              amazonSPService.syncProducts(account.id, account.userId)
                .catch(error => console.error(`Product sync failed for ${account.id}:`, error))
            );
          }

          if (syncTypes.includes('orders')) {
            syncPromises.push(
              amazonSPService.syncOrders(account.id)
                .catch(error => console.error(`Order sync failed for ${account.id}:`, error))
            );
          }

          if (syncTypes.includes('financial')) {
            syncPromises.push(
              amazonSPService.syncFinancialData(account.id)
                .catch(error => console.error(`Financial sync failed for ${account.id}:`, error))
            );
          }

          // Run syncs in parallel for this account
          await Promise.all(syncPromises);

          // Update last sync timestamp
          await storage.updateAmazonAccount(account.id, {
            lastSyncAt: new Date(),
            status: 'connected'
          });

          console.log(`Sync completed for account ${account.accountName}`);
          
        } catch (error) {
          console.error(`Sync failed for account ${account.id}:`, error);
          
          // Mark account as error but don't stop other syncs
          await storage.updateAmazonAccount(account.id, {
            lastSyncAt: new Date(),
            status: 'error'
          });
        }
      }
      
      console.log('Scheduled sync completed for all accounts');
      
    } catch (error) {
      console.error('Error during scheduled sync:', error);
    }
  }

  private async getAllConnectedAccounts() {
    // This is a simplified approach - in production you might want to optimize this
    // by adding a direct query to get all connected accounts
    try {
      // We need to implement a method to get all connected accounts across all users
      // For now, let's add this to the storage interface
      return await storage.getAllConnectedAmazonAccounts();
    } catch (error) {
      console.error('Error getting connected accounts:', error);
      return [];
    }
  }

  // Schedule sync for a specific account
  scheduleAccountSync(accountId: string, cronPattern: string = '0 */2 * * *') {
    if (this.syncJobs.has(accountId)) {
      this.syncJobs.get(accountId)?.stop();
    }

    const task = cron.schedule(cronPattern, async () => {
      try {
        const account = await storage.getAmazonAccount(accountId);
        if (!account || account.status !== 'connected') {
          return;
        }

        console.log(`Running scheduled sync for account ${account.accountName}`);
        
        await Promise.all([
          amazonSPService.syncOrders(accountId),
          amazonSPService.syncFinancialData(accountId)
        ]);

        await storage.updateAmazonAccount(accountId, {
          lastSyncAt: new Date()
        });

        console.log(`Scheduled sync completed for account ${account.accountName}`);
      } catch (error) {
        console.error(`Scheduled sync failed for account ${accountId}:`, error);
        await storage.updateAmazonAccount(accountId, {
          status: 'error',
          lastSyncAt: new Date()
        });
      }
    }, {
      scheduled: false
    });

    this.syncJobs.set(accountId, task);
    task.start();
    
    console.log(`Scheduled sync for account ${accountId} with pattern ${cronPattern}`);
  }

  // Remove scheduled sync for an account
  removeAccountSync(accountId: string) {
    const task = this.syncJobs.get(accountId);
    if (task) {
      task.stop();
      this.syncJobs.delete(accountId);
      console.log(`Removed scheduled sync for account ${accountId}`);
    }
  }

  // Get sync status for all scheduled jobs
  getSyncStatus() {
    const status = Array.from(this.syncJobs.entries()).map(([accountId, task]) => ({
      accountId,
      running: task.running,
      destroyed: task.destroyed
    }));

    return {
      scheduledJobs: status.length,
      runningJobs: status.filter(job => job.running).length,
      jobs: status
    };
  }

  // Manual trigger for testing
  async triggerManualSync(accountId: string, syncTypes: ('products' | 'orders' | 'financial')[] = ['orders', 'financial']) {
    try {
      const account = await storage.getAmazonAccount(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      console.log(`Manual sync triggered for account ${account.accountName}`);
      
      const syncPromises: Promise<void>[] = [];

      if (syncTypes.includes('products')) {
        syncPromises.push(amazonSPService.syncProducts(accountId, account.userId));
      }

      if (syncTypes.includes('orders')) {
        syncPromises.push(amazonSPService.syncOrders(accountId));
      }

      if (syncTypes.includes('financial')) {
        syncPromises.push(amazonSPService.syncFinancialData(accountId));
      }

      await Promise.all(syncPromises);

      await storage.updateAmazonAccount(accountId, {
        lastSyncAt: new Date(),
        status: 'connected'
      });

      console.log(`Manual sync completed for account ${account.accountName}`);
      return { success: true, message: 'Sync completed successfully' };
      
    } catch (error) {
      console.error(`Manual sync failed for account ${accountId}:`, error);
      
      await storage.updateAmazonAccount(accountId, {
        lastSyncAt: new Date(),
        status: 'error'
      });
      
      throw error;
    }
  }
}

export const syncScheduler = new SyncScheduler();