// Mock data and services for dataset sharing

const mockSharedByUser = [
  { id: 'share-1', dataset: { id: 'ds-001', name: 'Ancient Pottery Shards' }, sharedWith: { email: 'researcher1@example.com' }, permission: 'VIEW' },
  { id: 'share-2', dataset: { id: 'ds-002', name: 'Roman Coin Collection' }, sharedWith: { email: 'curator@museum.org' }, permission: 'EDIT' },
]

const mockSharedWithUser = [
  { id: 'share-3', dataset: { id: 'ds-003', name: 'Viking Runestones 3D Scans' }, sharedBy: { email: 'archaeologist@field.org' }, permission: 'VIEW' },
]

/**
 * Mock service to share a dataset with a user.
 * @param datasetId The ID of the dataset to share.
 * @param email The email of the user to share with.
 * @param permission The permission level ('VIEW' or 'EDIT').
 * @returns A promise that resolves with a success message.
 */
export const shareDataset = async (datasetId: string, email: string, permission: string) => {
  console.log(`Sharing dataset ${datasetId} with ${email} with permission ${permission}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Simulate adding a new share
  mockSharedByUser.push({
    id: `share-${Date.now()}`,
    dataset: { id: datasetId, name: 'Newly Shared Dataset' },
    sharedWith: { email },
    permission,
  });
  return { success: true, message: `Dataset shared successfully with ${email}` }
}

/**
 * Mock service to fetch datasets shared by and with the current user.
 * @returns A promise that resolves with the shared data.
 */
export const getSharingData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { sharedByUser: mockSharedByUser, sharedWithUser: mockSharedWithUser }
}

/**
 * Mock service to revoke a dataset share.
 * @param shareId The ID of the share to revoke.
 * @returns A promise that resolves with a success message.
 */
export const revokeShare = async (shareId: string) => {
  console.log(`Revoking share ${shareId}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  const index = mockSharedByUser.findIndex(share => share.id === shareId);
  if (index > -1) {
    mockSharedByUser.splice(index, 1);
  }
  return { success: true, message: 'Share revoked successfully' }
}
