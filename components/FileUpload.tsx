import React, { useState, useCallback } from 'react';
import { UploadedFile } from '../types';
import { UploadCloudIcon } from './icons';
import { PERSONAS } from '../constants';

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;

    if (files.length < 2 || files.length > 4) {
      setError("Please upload between 2 and 4 subject photos.");
      return;
    }

    const uploadedFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      personaId: PERSONAS[0].id,
    }));
    onFilesChange(uploadedFiles);
  }, [onFilesChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // This is necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative block w-full border-2 ${isDragging ? 'border-[#E4A0AF]' : 'border-zinc-700'} border-dashed rounded-lg p-12 text-center hover:border-[#E4A0AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#E4A0AF] transition-colors duration-300 bg-zinc-900`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleChange}
          className="sr-only"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-500" />
          <span className="mt-2 block text-sm font-medium text-gray-300">
            Drag & drop subject photos here, or click to select
          </span>
          <p className="mt-1 text-xs text-gray-500">
            Upload 2 to 4 subject photos (PNG, JPG, WEBP)
          </p>
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;