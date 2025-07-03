import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      did: 'did:ethr:0x1234567890123456789012345678901234567890',
      profile: {
        name: 'Test User',
        institution: 'Test University',
        role: 'Researcher'
      }
    }
  })

  console.log(`Created user: ${user.id}`)

  // Create a DID document for the user
  const didDocument = await prisma.dIDDocument.create({
    data: {
      did: user.did,
      userId: user.id,
      document: {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: user.did,
        authentication: [
          {
            id: `${user.did}#keys-1`,
            type: 'Ed25519VerificationKey2018',
            controller: user.did,
            publicKeyBase58: 'H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV'
          }
        ],
        service: [
          {
            id: `${user.did}#sapphire-service`,
            type: 'SapphireService',
            serviceEndpoint: 'https://sapphire-api.example.com/users/' + user.id
          }
        ]
      }
    }
  })

  console.log(`Created DID document: ${didDocument.id}`)

  // Create test dataset
  const dataset = await prisma.dataset.create({
    data: {
      did: 'did:ethr:0x2234567890123456789012345678901234567890',
      title: 'Test Cultural Heritage Dataset',
      description: 'A sample dataset containing museum artifacts metadata',
      fileHash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      filePath: '/uploads/test-dataset.zip',
      fileSize: 1024 * 1024 * 5, // 5MB
      mimeType: 'application/zip',
      metadata: {
        source: 'Test Museum',
        createdDate: new Date().toISOString(),
        itemCount: 42,
        category: 'artifacts',
        period: 'renaissance'
      },
      aiTags: ['museum', 'artifact', 'renaissance', 'painting'],
      isPublic: true,
      userId: user.id
    }
  })

  console.log(`Created dataset: ${dataset.id}`)

  // Create a DID document for the dataset
  await prisma.dIDDocument.create({
    data: {
      did: dataset.did,
      userId: user.id,
      document: {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: dataset.did,
        authentication: [
          {
            id: `${dataset.did}#keys-1`,
            type: 'Ed25519VerificationKey2018',
            controller: user.did,
            publicKeyBase58: 'H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV'
          }
        ],
        service: [
          {
            id: `${dataset.did}#dataset-service`,
            type: 'DatasetMetadataService',
            serviceEndpoint: 'https://sapphire-api.example.com/datasets/' + dataset.id
          }
        ]
      }
    }
  })

  // Create permissions for the dataset
  await prisma.permission.create({
    data: {
      resourceType: 'dataset',
      resourceId: dataset.id,
      permission: 'read',
      userId: user.id,
      datasetId: dataset.id,
      isActive: true
    }
  })

  // Create consent record
  await prisma.consentRecord.create({
    data: {
      consentType: 'data_processing',
      isGranted: true,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Test User Agent)',
      userId: user.id
    }
  })

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      userId: user.id,
      ipAddress: '192.168.1.1',
      details: { note: 'User registered' }
    }
  })

  await prisma.auditLog.create({
    data: {
      action: 'create',
      resource: 'dataset',
      resourceId: dataset.id,
      userId: user.id,
      ipAddress: '192.168.1.1',
      details: { note: 'Dataset uploaded' }
    }
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
