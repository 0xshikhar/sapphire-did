"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_service_1 = require("./database.service");
const did_service_1 = require("./did.service");
/**
 * Service for user management
 */
class UserService {
    constructor() {
        this.didService = new did_service_1.DIDService();
    }
    /**
     * Create a new user with DID
     * @param email User's email
     * @param profile Optional profile information
     * @returns The created user object
     */
    async createUser(email, profile) {
        // Create a new DID for the user
        const did = await this.didService.createDID();
        // Create the user in the database
        const user = await database_service_1.db.user.create({
            data: {
                email,
                did,
                profile: profile || {},
            },
        });
        // Create a DID document for the user
        await database_service_1.db.dIDDocument.create({
            data: {
                did,
                document: await this.didService.createDIDDocument(did),
                userId: user.id,
                version: 1,
            },
        });
        return user;
    }
    /**
     * Get user by ID
     * @param userId User's ID
     * @returns User object
     */
    async getUserById(userId) {
        return await database_service_1.db.user.findUnique({
            where: { id: userId },
        });
    }
    /**
     * Get user by email
     * @param email User's email
     * @returns User object
     */
    async getUserByEmail(email) {
        return await database_service_1.db.user.findUnique({
            where: { email },
        });
    }
    /**
     * Get user by DID
     * @param did User's DID
     * @returns User object
     */
    async getUserByDID(did) {
        return await database_service_1.db.user.findUnique({
            where: { did },
        });
    }
    /**
     * Update user profile
     * @param userId User's ID
     * @param profile Updated profile data
     * @returns Updated user object
     */
    async updateUserProfile(userId, profile) {
        const user = await database_service_1.db.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Merge existing profile with new data
        const updatedProfile = Object.assign(Object.assign({}, user.profile), profile);
        return await database_service_1.db.user.update({
            where: { id: userId },
            data: { profile: updatedProfile },
        });
    }
}
exports.UserService = UserService;
