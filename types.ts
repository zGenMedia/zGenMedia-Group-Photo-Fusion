export type Quality = 'Standard' | 'High' | 'Ultra High';

export interface Pose {
  id: string;
  title: string;
  description: string;
  getPrompt: (personaDescriptions: string[], quality: Quality, hasBackground: boolean) => string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  type?: 'female' | 'male';
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  personaId: string;
}

export interface GeneratePhotoResult {
    imageBase64: string;
    responseText: string;
}

export interface GeneratedImage {
  id: string;
  base64: string | null;
  status: 'generating' | 'success' | 'error';
  error?: string;
}

export interface DebugInfo {
    prompt: string;
    subjects: UploadedFile[];
    background: UploadedFile | null;
    quality: Quality;
    apiResponseText: string;
    generatedImageBase64: string;
}