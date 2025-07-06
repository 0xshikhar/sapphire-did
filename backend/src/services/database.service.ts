import { PrismaClient } from '@prisma/client'

/**
 * Database service that provides a singleton instance of the Prisma client.
 * Uses the singleton pattern to ensure only one instance of PrismaClient is created.
 */
export class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    })
  }

  /**
   * Get the singleton instance of DatabaseService
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  /**
   * Get the Prisma client instance
   */
  getPrisma(): PrismaClient {
    return this.prisma
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Export a singleton instance of the Prisma client
export const db = DatabaseService.getInstance().getPrisma()
