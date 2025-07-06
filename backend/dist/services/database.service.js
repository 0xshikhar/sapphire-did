"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseService = void 0;
const client_1 = require("@prisma/client");
/**
 * Database service that provides a singleton instance of the Prisma client.
 * Uses the singleton pattern to ensure only one instance of PrismaClient is created.
 */
class DatabaseService {
    constructor() {
        this.prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
        });
    }
    /**
     * Get the singleton instance of DatabaseService
     */
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    /**
     * Get the Prisma client instance
     */
    getPrisma() {
        return this.prisma;
    }
    /**
     * Disconnect from the database
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.DatabaseService = DatabaseService;
// Export a singleton instance of the Prisma client
exports.db = DatabaseService.getInstance().getPrisma();
