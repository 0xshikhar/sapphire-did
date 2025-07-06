import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../types/request.types'
import { DIDService } from '../services/did.service'
import { GDPRService } from '../services/gdpr.service'
import { authenticateUser } from './user.controller'

export const didRouter = Router()
const didService = new DIDService()
const gdprService = new GDPRService()

/**
 * Create a new DID
 * POST /dids
 */
didRouter.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const did = await didService.createDID()
    
    // Create initial DID document
    const document = await didService.createDIDDocument(did)
    
    // Store the DID document in database
    await didService.storeNewDIDDocument(did, document, userId)
    
    // Record the DID creation
    await gdprService.recordDataAccess(
      userId,
      'did',
      did,
      'create',
      req.ip,
      req.headers['user-agent']
    )
    
    res.status(201).json({ did, document })
  } catch (error) {
    console.error('Create DID error:', error)
    res.status(500).json({ error: 'Failed to create DID' })
  }
})

/**
 * Get DID document by DID
 * GET /dids/:did
 */
didRouter.get('/:did', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const did = req.params.did
    const didDocument = await didService.resolveDID(did)
    
    if (!didDocument) {
      return res.status(404).json({ error: 'DID document not found' })
    }
    
    // If user is authenticated, record the access
    if (req.user) {
      await gdprService.recordDataAccess(
        req.user.id,
        'did',
        did,
        'read',
        req.ip,
        req.headers['user-agent']
      )
    }
    
    res.status(200).json(didDocument)
  } catch (error) {
    console.error('Get DID document error:', error)
    res.status(500).json({ error: 'Failed to resolve DID' })
  }
})

/**
 * Get history of DID document versions
 * GET /dids/:did/history
 */
didRouter.get('/:did/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const did = req.params.did
    const history = await didService.getDIDHistory(did)
    
    if (!history || history.length === 0) {
      return res.status(404).json({ error: 'DID history not found' })
    }
    
    // If user is authenticated, record the access
    if (req.user) {
      await gdprService.recordDataAccess(
        req.user.id,
        'did_history',
        did,
        'read',
        req.ip,
        req.headers['user-agent']
      )
    }
    
    res.status(200).json(history)
  } catch (error) {
    console.error('Get DID history error:', error)
    res.status(500).json({ error: 'Failed to retrieve DID history' })
  }
})

/**
 * Update a DID document
 * PUT /dids/:did
 */
didRouter.put('/:did', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const did = req.params.did
    const documentUpdate = req.body
    
    if (!documentUpdate || typeof documentUpdate !== 'object') {
      return res.status(400).json({ error: 'Valid DID document update required' })
    }
    
    // Check ownership before updating
    const canUpdate = await didService.verifyDIDOwnership(did, userId)
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this DID document' })
    }
    
    // Update the DID document
    const updatedDocument = await didService.updateDIDDocument(did, documentUpdate, userId)
    
    // Record the update
    await gdprService.recordDataAccess(
      userId,
      'did',
      did,
      'update',
      req.ip,
      req.headers['user-agent']
    )
    
    res.status(200).json(updatedDocument)
  } catch (error: any) {
    if (error.message.includes('ownership')) {
      return res.status(403).json({ error: error.message })
    }
    console.error('Update DID document error:', error)
    res.status(500).json({ error: 'Failed to update DID document' })
  }
})

/**
 * Add a verification method to a DID document
 * POST /dids/:did/verification-methods
 */
didRouter.post('/:did/verification-methods', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const did = req.params.did
    const { id, type, controller, publicKeyBase58 } = req.body
    
    // Validate required fields
    if (!id || !type || !controller || !publicKeyBase58) {
      return res.status(400).json({
        error: 'All fields are required: id, type, controller, publicKeyBase58'
      })
    }
    
    // Check ownership before updating
    const canUpdate = await didService.verifyDIDOwnership(did, userId)
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this DID document' })
    }
    
    // Add verification method
    const verificationMethod = { id, type, controller, publicKeyBase58 }
    const updatedDocument = await didService.addVerificationMethod(did, verificationMethod, userId)
    
    // Record the update
    await gdprService.recordDataAccess(
      userId,
      'did',
      did,
      'update',
      req.ip,
      req.headers['user-agent']
    )
    
    res.status(200).json(updatedDocument)
  } catch (error: any) {
    if (error.message.includes('ownership')) {
      return res.status(403).json({ error: error.message })
    }
    console.error('Add verification method error:', error)
    res.status(500).json({ error: 'Failed to add verification method' })
  }
})

/**
 * Add a service to a DID document
 * POST /dids/:did/services
 */
didRouter.post('/:did/services', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const did = req.params.did
    const { id, type, serviceEndpoint } = req.body
    
    // Validate required fields
    if (!id || !type || !serviceEndpoint) {
      return res.status(400).json({
        error: 'All fields are required: id, type, serviceEndpoint'
      })
    }
    
    // Check ownership before updating
    const canUpdate = await didService.verifyDIDOwnership(did, userId)
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this DID document' })
    }
    
    // Add service
    const service = { id, type, serviceEndpoint }
    const updatedDocument = await didService.addService(did, service, userId)
    
    // Record the update
    await gdprService.recordDataAccess(
      userId,
      'did',
      did,
      'update',
      req.ip,
      req.headers['user-agent']
    )
    
    res.status(200).json(updatedDocument)
  } catch (error: any) {
    if (error.message.includes('ownership')) {
      return res.status(403).json({ error: error.message })
    }
    console.error('Add service error:', error)
    res.status(500).json({ error: 'Failed to add service' })
  }
})

/**
 * Remove a service from a DID document
 * DELETE /dids/:did/services/:serviceId
 */
didRouter.delete('/:did/services/:serviceId', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { did, serviceId } = req.params;

    // Ownership is verified inside the service method
    const updatedDocument = await didService.removeService(did, serviceId, userId);

    // Record the update
    await gdprService.recordDataAccess(
      userId,
      'did',
      did,
      'update',
      req.ip,
      req.headers['user-agent']
    );

    res.status(200).json(updatedDocument);
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ error: error.message });
    }
    console.error('Remove service error:', error);
    res.status(500).json({ error: 'Failed to remove service' });
  }
});

/**
 * Deactivate a DID
 * DELETE /dids/:did
 */
didRouter.delete('/:did', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string
    const did = req.params.did
    
    // Check ownership before deactivating
    const canUpdate = await didService.verifyDIDOwnership(did, userId)
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to deactivate this DID' })
    }
    
    // Deactivate the DID
    await didService.deactivateDID(did, userId)
    
    // Record the deactivation
    await gdprService.recordDataAccess(
      userId,
      'did',
      did,
      'delete',
      req.ip,
      req.headers['user-agent']
    )
    
    res.status(200).json({ message: 'DID deactivated successfully' })
  } catch (error: any) {
    if (error.message.includes('ownership')) {
      return res.status(403).json({ error: error.message })
    }
    console.error('Deactivate DID error:', error)
    res.status(500).json({ error: 'Failed to deactivate DID' })
  }
})
