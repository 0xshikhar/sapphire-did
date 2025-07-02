import { Router, Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { GDPRService } from '../services/gdpr.service'
import * as jwt from 'jsonwebtoken'
import { AuthenticatedRequest } from '../types/request.types'

export const userRouter = Router()
const userService = new UserService()
const gdprService = new GDPRService()

/**
 * Middleware to authenticate user from JWT token
 */
export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization format' })
    }

    const jwtSecret = process.env.JWT_SECRET || 'sapphire-dev-secret'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; did: string; iat: number; exp: number }

    if (!decoded || !decoded.userId || !decoded.did) {
      return res.status(401).json({ error: 'Invalid token payload' })
    }

    // Attach user to request object
    req.user = { id: decoded.userId, did: decoded.did }
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Authentication error' })
  }
}



/**
 * Get current user profile
 * GET /users/me
 */
userRouter.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const user = await userService.getUserById(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
})

/**
 * Update user profile
 * PATCH /users/me
 */
userRouter.patch('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const { profile } = req.body

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'Profile data is required' })
    }

    const updatedUser = await userService.updateUserProfile(userId, profile)

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

/**
 * Export user data (GDPR data portability)
 * GET /users/export-data
 */
userRouter.get('/export-data', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const userData = await gdprService.exportUserData(userId)

    // Record the export
    await gdprService.recordDataAccess(
      userId,
      'user',
      userId,
      'read',
      req.ip,
      req.headers['user-agent']
    )

    // Set filename with user ID and date
    const filename = `user-data-${userId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.json`
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json(userData)
  } catch (error) {
    console.error('Data export error:', error)
    res.status(500).json({ error: 'Failed to export user data' })
  }
})

/**
 * Delete user account (GDPR right to erasure)
 * DELETE /users/me
 */
userRouter.delete('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const { confirmation } = req.body

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        error: 'Please provide confirmation to delete your account'
      })
    }

    // Choose soft delete by default for safety
    const softDelete = req.query.hardDelete !== 'true'
    await gdprService.deleteUserData(userId, softDelete)

    res.status(200).json({
      message: softDelete
        ? 'Account anonymized successfully'
        : 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

/**
 * Manage user consent
 * POST /users/consent
 */
userRouter.post('/consent', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const { consentType, isGranted } = req.body

    if (!consentType || typeof isGranted !== 'boolean') {
      return res.status(400).json({
        error: 'Consent type and granted status are required'
      })
    }

    const consent = await gdprService.recordConsent(
      userId,
      consentType,
      isGranted,
      req.ip,
      req.headers['user-agent']
    )

    res.status(200).json({
      message: `Consent ${isGranted ? 'granted' : 'revoked'} successfully`,
      consent
    })
  } catch (error) {
    console.error('Consent management error:', error)
    res.status(500).json({ error: 'Failed to update consent preferences' })
  }
})

/**
 * Get user consent history
 * GET /users/consent
 */
userRouter.get('/consent', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const consents = await gdprService.getUserConsents(userId)

    res.status(200).json(consents)
  } catch (error) {
    console.error('Get consent history error:', error)
    res.status(500).json({ error: 'Failed to retrieve consent history' })
  }
})

/**
 * Revoke a specific consent
 * DELETE /users/consent/:id
 */
userRouter.delete('/consent/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const consentId = req.params.id

    const updatedConsent = await gdprService.revokeConsent(consentId, userId)

    res.status(200).json({
      message: 'Consent revoked successfully',
      consent: updatedConsent
    })
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('Not authorized')) {
      return res.status(404).json({ error: error.message })
    }
    console.error('Revoke consent error:', error)
    res.status(500).json({ error: 'Failed to revoke consent' })
  }
})
