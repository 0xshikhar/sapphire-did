

// A basic representation of the Dataset type, aligning with the backend model.
export interface Dataset {
  id: string;
  did: string;
  title: string;
  description: string | null;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  metadata: any;
  aiTags: string[];
}

/**
 * Fetches the datasets owned by the currently authenticated user.
 * The request is authenticated using the session token.
 * @returns A promise that resolves to an array of datasets.
 */
export async function getMyDatasets(token: string): Promise<Dataset[]> {
  if (!token) {
    throw new Error("Authentication token not provided.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/datasets/my-datasets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch datasets' }));
    throw new Error(errorData.message || 'Failed to fetch datasets');
  }

  return response.json();
}

/**
 * Unlinks a dataset from its DID by removing the associated service endpoint.
 * @param datasetDid The DID of the dataset to unlink.
 * @returns A promise that resolves when the operation is successful.
 */
export async function unlinkDataset(datasetDid: string, token: string): Promise<void> {
  if (!token) {
    throw new Error("Authentication token not provided.");
  }

  // The serviceId is constructed based on the convention defined in the backend
  const serviceId = `${datasetDid}#dataset-service`;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dids/${datasetDid}/services/${serviceId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to unlink dataset' }));
    throw new Error(errorData.message || 'Failed to unlink dataset');
  }

  // No content is expected on successful deletion
  return;
}
