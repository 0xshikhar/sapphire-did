import { db } from './database.service'
import { DIDService } from './did.service'
import { User  } from '@prisma/client'

/**
 * Service for user management
 */
export class UserService {
  private didService = new DIDService()

  /**
   * Create a new user with DID
   * @param email User's email
   * @param profile Optional profile information
   * @returns The created user object
   */
  async createUser(email: string, profile?: any): Promise<User> {
    // Create a new DID for the user
    const did = await this.didService.createDID()

    // Create the user in the database
    const user = await db.user.create({
      data: {
        email,
        did,
        profile: profile || {},
      },
    })

    // Create a DID document for the user
    await db.dIDDocument.create({
      data: {
        did,
        document: await this.didService.createDIDDocument(did),
        userId: user.id,
        version: 1,
      },
    })

    return user
  }

  /**
   * Get user by ID
   * @param userId User's ID
   * @returns User object
   */
  async getUserById(userId: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { id: userId },
    })
  }

  /**
   * Get user by email
   * @param email User's email
   * @returns User object
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { email },
    })
  }

  /**
   * Get user by DID
   * @param did User's DID
   * @returns User object
   */
  async getUserByDID(did: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { did },
    })
  }

  /**
   * Update user profile
   * @param userId User's ID
   * @param profile Updated profile data
   * @returns Updated user object
   */
  async updateUserProfile(userId: string, profile: any): Promise<User> {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Merge existing profile with new data
    const updatedProfile = {
      ...(user.profile as object),
      ...profile,
    }

    return await db.user.update({
      where: { id: userId },
      data: { profile: updatedProfile },
    })
  }
}
