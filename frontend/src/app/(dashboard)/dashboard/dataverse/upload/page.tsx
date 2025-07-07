'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface Author {
  name: string;
  affiliation?: string;
  identifier?: string;
}

interface Contact {
  name: string;
  email: string;
  affiliation?: string;
}

interface DatasetMetadata {
  title: string;
  description: string;
  authors: Author[];
  contacts: Contact[];
  subjects: string[];
  kindOfData: string[];
  geographicCoverage: string[];
  license?: string;
  language?: string;
}

interface FileUpload {
  file: File;
  description: string;
  directoryLabel: string;
  categories: string[];
  restrict: boolean;
}

export default function DataverseUploadPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>('dataset');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dataset creation state
  const [dataverseAlias, setDataverseAlias] = useState('harvard');
  const [apiToken, setApiToken] = useState('');
  const [createLocalCopy, setCreateLocalCopy] = useState(true);
  const [metadata, setMetadata] = useState<DatasetMetadata>({
    title: '',
    description: '',
    authors: [{ name: '' }],
    contacts: [{ name: '', email: '' }],
    subjects: [],
    kindOfData: [],
    geographicCoverage: [],
    license: 'CC0 1.0',
    language: 'English'
  });

  // File upload state
  const [uploadToDatasetId, setUploadToDatasetId] = useState('');
  const [filesToUpload, setFilesToUpload] = useState<FileUpload[]>([]);
  const [enhanceWithAI, setEnhanceWithAI] = useState(true);

  // Predefined options
  const subjectOptions = [
    'Arts and Humanities',
    'Cultural Heritage',
    'History',
    'Archaeology',
    'Anthropology',
    'Museum Studies',
    'Digital Humanities',
    'Social Sciences',
    'Other'
  ];

  const kindOfDataOptions = [
    'Archaeological data',
    'Historical documents',
    'Oral history',
    'Photographs',
    'Manuscripts',
    'Cultural artifacts',
    'Audio recordings',
    'Video recordings',
    'Survey data',
    'Other'
  ];

  const handleAddAuthor = () => {
    setMetadata(prev => ({
      ...prev,
      authors: [...prev.authors, { name: '' }]
    }));
  };

  const handleRemoveAuthor = (index: number) => {
    setMetadata(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAuthor = (index: number, field: keyof Author, value: string) => {
    setMetadata(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) =>
        i === index ? { ...author, [field]: value } : author
      )
    }));
  };

  const handleAddContact = () => {
    setMetadata(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', email: '' }]
    }));
  };

  const handleRemoveContact = (index: number) => {
    setMetadata(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateContact = (index: number, field: keyof Contact, value: string) => {
    setMetadata(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const handleAddSubject = (subject: string) => {
    if (!metadata.subjects.includes(subject)) {
      setMetadata(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setMetadata(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      file,
      description: '',
      directoryLabel: '',
      categories: [],
      restrict: false
    }));
    setFilesToUpload(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateFileMetadata = (index: number, field: keyof Omit<FileUpload, 'file'>, value: any) => {
    setFilesToUpload(prev => prev.map((fileUpload, i) =>
      i === index ? { ...fileUpload, [field]: value } : fileUpload
    ));
  };

  const handleCreateDataset = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      // Validate required fields
      if (!metadata.title || !metadata.description || !apiToken) {
        throw new Error('Please fill in all required fields');
      }

      if (metadata.authors.some(a => !a.name) || metadata.contacts.some(c => !c.name || !c.email)) {
        throw new Error('Please fill in all author and contact information');
      }

      if (metadata.subjects.length === 0) {
        throw new Error('Please select at least one subject');
      }

      setProgress(25);

      const response = await fetch('/api/dataverse/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          dataverseAlias,
          metadata,
          apiToken,
          createLocalCopy
        })
      });

      setProgress(75);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create dataset');
      }

      const result = await response.json();
      setProgress(100);

      setSuccess(`Dataset created successfully! Dataverse ID: ${result.dataverse.persistentId}`);

      // Reset form
      setMetadata({
        title: '',
        description: '',
        authors: [{ name: '' }],
        contacts: [{ name: '', email: '' }],
        subjects: [],
        kindOfData: [],
        geographicCoverage: [],
        license: 'CC0 1.0',
        language: 'English'
      });

      // If files are selected, switch to upload tab and set the dataset ID
      if (filesToUpload.length > 0) {
        setUploadToDatasetId(result.dataverse.persistentId);
        setCurrentTab('files');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleUploadFiles = async () => {
    if (!uploadToDatasetId || !apiToken || filesToUpload.length === 0) {
      setError('Please provide dataset ID, API token, and select files to upload');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      const uploadPromises = filesToUpload.map(async (fileUpload, index) => {
        const formData = new FormData();
        formData.append('file', fileUpload.file);
        formData.append('apiToken', apiToken);
        formData.append('enhanceWithAI', enhanceWithAI.toString());
        formData.append('metadata', JSON.stringify({
          description: fileUpload.description,
          directoryLabel: fileUpload.directoryLabel,
          categories: fileUpload.categories,
          restrict: fileUpload.restrict
        }));

        const response = await fetch(`/api/dataverse/datasets/${uploadToDatasetId}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to upload ${fileUpload.file.name}: ${errorData.details || errorData.error}`);
        }

        setProgress(((index + 1) / filesToUpload.length) * 100);
        return await response.json();
      });

      await Promise.all(uploadPromises);
      setSuccess(`Successfully uploaded ${filesToUpload.length} file(s) to Dataverse`);
      setFilesToUpload([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div>
        <div className="container mx-auto py-6 max-w-4xl">
          < div className="mb-6">
            < h1 className="text-3xl font-bold">Upload to Dataverse</h1>
            < p className="text-muted-foreground mt-2">
              Create datasets and upload files to Harvard Dataverse with DID integration
            </p >
          </div >

          {error && (
            <Alert variant="destructive" className="mb-6">
              < AlertCircle className="h-4 w-4" />
              < AlertDescription > {error}</AlertDescription >
            </Alert >
          )
          }

          {
            success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                < CheckCircle2 className="h-4 w-4 text-green-600" />
                < AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert >
            )
          }

          {
            isLoading && (
              <div className="mb-6">
                < Progress value={progress} className="w-full" />
                < p className="text-sm text-muted-foreground mt-2">
                  {currentTab === 'dataset' ? 'Creating dataset...' : 'Uploading files...'}
                </p >
              </div >
            )
          }

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dataset">Create Dataset</TabsTrigger>
              <TabsTrigger value="files">Upload Files</TabsTrigger>
            </TabsList >

            <TabsContent value="dataset" className="space-y-6">
              < Card >
                <CardHeader>
                  <CardTitle>Dataset Information</CardTitle>
                  <CardDescription>
                    Create a new dataset in Harvard Dataverse with automatic DID generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    < div className="space-y-2">
                      < Label htmlFor="dataverse-alias">Dataverse Collection</Label>
                      < Select value={dataverseAlias} onValueChange={setDataverseAlias} >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="harvard">Harvard Dataverse</SelectItem>
                          <SelectItem value="root">Root Dataverse</SelectItem>
                        </SelectContent >
                      </Select >
                    </div >
                    <div className="space-y-2">
                      < Label htmlFor="api-token">API Token *</Label>
                      < Input
                        id="api-token"
                        type="password"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)
                        }
                        placeholder="Your Dataverse API token"
                      />
                    </div >
                  </div >

                  <div className="space-y-2">
                    < Label htmlFor="title">Title *</Label>
                    < Input
                      id="title"
                      value={metadata.title}
                      onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Dataset title"
                    />
                  </div >

                  <div className="space-y-2">
                    < Label htmlFor="description">Description *</Label>
                    < Textarea
                      id="description"
                      value={metadata.description}
                      onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your dataset..."
                      rows={4}
                    />
                  </div >

                  {/* Authors */}
                  < div className="space-y-4">
                    < div className="flex justify-between items-center">
                      < Label > Authors *</Label >
                      <Button type="button" variant="outline" size="sm" onClick={handleAddAuthor}>
                        < Plus className="h-4 w-4 mr-2" />
                        Add Author
                      </Button >
                    </div >
                    {
                      metadata.authors.map((author, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                          < Input
                            placeholder="Name *"
                            value={author.name}
                            onChange={(e) => handleUpdateAuthor(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Affiliation"
                            value={author.affiliation || ''}
                            onChange={(e) => handleUpdateAuthor(index, 'affiliation', e.target.value)}
                          />
                          < Input
                            placeholder="ORCID ID"
                            value={author.identifier || ''}
                            onChange={(e) => handleUpdateAuthor(index, 'identifier', e.target.value)}
                          />
                          < Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAuthor(index)}
                            disabled={metadata.authors.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button >
                        </div >
                      ))}
                  </div >

                  {/* Contacts */}
                  < div className="space-y-4">
                    < div className="flex justify-between items-center">
                      < Label > Contacts *</Label >
                      <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
                        < Plus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button >
                    </div >
                    {
                      metadata.contacts.map((contact, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                          < Input
                            placeholder="Name *"
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Email *"
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleUpdateContact(index, 'email', e.target.value)}
                          />
                          < Input
                            placeholder="Affiliation"
                            value={contact.affiliation || ''}
                            onChange={(e) => handleUpdateContact(index, 'affiliation', e.target.value)}
                          />
                          < Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveContact(index)}
                            disabled={metadata.contacts.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button >
                        </div >
                      ))}
                  </div >

                  {/* Subjects */}
                  < div className="space-y-4">
                    < Label > Subjects *</Label >
                    <Select onValueChange={handleAddSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map(subject => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2">
                      {
                        metadata.subjects.map(subject => (
                          <Badge key={subject} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSubject(subject)}>
                            {subject} ×
                          </Badge >
                        ))
                      }
                    </div >
                  </div >

                  {/* Options */}
                  < div className="flex items-center space-x-2">
                    < Switch
                      id="create-local-copy"
                      checked={createLocalCopy}
                      onCheckedChange={setCreateLocalCopy}
                    />
                    <Label htmlFor="create-local-copy">Create local copy with DID</Label>
                  </div >

                  <Button
                    onClick={handleCreateDataset}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {
                      isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Dataset...
                        </>
                      ) : (
                        'Create Dataset in Dataverse'
                      )}
                  </Button >
                </CardContent >
              </Card >
            </TabsContent >

            <TabsContent value="files" className="space-y-6">
              < Card >
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                  <CardDescription>
                    Upload files to an existing Dataverse dataset with AI enhancement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  < div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    < div className="space-y-2">
                      < Label htmlFor="dataset-id">Dataset ID *</Label>
                      < Input
                        id="dataset-id"
                        value={uploadToDatasetId}
                        onChange={(e) => setUploadToDatasetId(e.target.value)}
                        placeholder="DOI or dataset ID"
                      />
                    </div >
                    <div className="space-y-2">
                      < Label htmlFor="upload-api-token">API Token *</Label>
                      < Input
                        id="upload-api-token"
                        type="password"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        placeholder="Your Dataverse API token"
                      />
                    </div >
                  </div >

                  <div className="flex items-center space-x-2">
                    < Switch
                      id="enhance-ai"
                      checked={enhanceWithAI}
                      onCheckedChange={setEnhanceWithAI}
                    />
                    <Label htmlFor="enhance-ai">Enhance metadata with AI</Label>
                  </div >

                  <div className="space-y-2">
                    < Label htmlFor="file-upload">Select Files</Label>
                    < Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div >

                  {
                    filesToUpload.length > 0 && (
                      <div className="space-y-4">
                        <Label>Files to Upload({filesToUpload.length
                        })</Label >
                        {
                          filesToUpload.map((fileUpload, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3">
                              < div className="flex justify-between items-center">
                                < span className="font-medium">{fileUpload.file.name}</span>
                                < Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button >
                              </div >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                < Input
                                  placeholder="Description"
                                  value={fileUpload.description}
                                  onChange={(e) => handleUpdateFileMetadata(index, 'description', e.target.value)}
                                />
                                < Input
                                  placeholder="Directory"
                                  value={fileUpload.directoryLabel}
                                  onChange={(e) => handleUpdateFileMetadata(index, 'directoryLabel', e.target.value)}
                                />
                              </div >
                              <div className="flex items-center space-x-2">
                                < Switch
                                  checked={fileUpload.restrict}
                                  onCheckedChange={(checked) => handleUpdateFileMetadata(index, 'restrict', checked)}
                                />
                                < Label > Restrict access</Label >
                              </div >
                            </div >
                          ))}
                      </div >
                    )}

                  <Button
                    onClick={handleUploadFiles}
                    disabled={isLoading || filesToUpload.length === 0}
                    className="w-full"
                  >
                    {
                      isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading Files...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload {filesToUpload.length} File(s)
                        </>
                      )}
                  </Button >
                </CardContent >
              </Card >
            </TabsContent >
          </Tabs >
        </div >
      </div >
    </div >

  )
}
