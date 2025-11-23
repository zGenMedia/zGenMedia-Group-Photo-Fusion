import React from 'react';
import { DebugInfo, UploadedFile } from '../types';

interface DebugSectionProps {
  debugInfos: DebugInfo[];
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ImageDetailCard: React.FC<{ image: UploadedFile; title: string }> = ({ image, title }) => (
    <div className="text-center">
        <img src={image.previewUrl} alt={title} className="w-full aspect-square object-cover rounded-md shadow-lg" />
        <div className="mt-2 text-xs text-left bg-zinc-800 p-2 rounded-md">
            <p className="text-gray-300 font-bold truncate" title={image.file.name}>{title}</p>
            <p className="text-gray-400 truncate" title={image.file.name}>{image.file.name}</p>
            <p className="text-gray-400">{formatBytes(image.file.size)}</p>
            <p className="text-gray-400">{image.file.type}</p>
        </div>
    </div>
);

const DebugSection: React.FC<DebugSectionProps> = ({ debugInfos }) => {
  if (debugInfos.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 p-6 bg-zinc-900 border border-zinc-700 rounded-lg" aria-labelledby="debug-heading">
      <h2 id="debug-heading" className="text-2xl font-bold text-[#E4A0AF] mb-6">Debug Information</h2>
      
      <div className="space-y-12">
        {debugInfos.map((debugInfo, index) => {
           const { prompt, subjects, background, quality, apiResponseText, generatedImageBase64 } = debugInfo;
           const generatedImageUrl = `data:image/jpeg;base64,${generatedImageBase64}`;

           return (
            <div key={index} className="border-t border-zinc-700 pt-8 first:border-t-0 first:pt-0">
                <h3 className="text-xl font-semibold text-[#E4A0AF] mb-4">Generation Attempt #{index + 1}</h3>
                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Input Images:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {subjects.map((image, index) => (
                            <ImageDetailCard key={image.id} image={image} title={`Subject ${index + 1}`} />
                            ))}
                            {background && (
                            <ImageDetailCard key={background.id} image={background} title="Background" />
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Output Image:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <div className="text-center">
                                <img src={generatedImageUrl} alt="Generated Output" className="w-full aspect-square object-cover rounded-md shadow-lg" />
                                <div className="mt-2 text-xs text-left bg-zinc-800 p-2 rounded-md">
                                    <p className="text-gray-300 font-bold">Generated Image</p>
                                    <p className="text-gray-400">Format: JPEG</p>
                                    <p className="text-gray-400">Approx. Size: {formatBytes(generatedImageBase64.length * 3 / 4)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-2">Configuration:</h4>
                            <div className="bg-black text-gray-300 p-4 rounded-md text-sm">
                                <p><strong className="text-gray-100">Quality:</strong> {quality}</p>
                            </div>
                        </div>

                        <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Generated Prompt:</h4>
                        <pre className="bg-black text-gray-300 p-4 rounded-md text-sm whitespace-pre-wrap font-mono break-words" aria-label="The full prompt sent to the AI">{prompt}</pre>
                        </div>

                        <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Raw API Text Response:</h4>
                        <pre className="bg-black text-gray-300 p-4 rounded-md text-sm whitespace-pre-wrap font-mono break-words" aria-label="The raw text response from the Gemini API">{apiResponseText}</pre>
                        </div>
                    </div>
                </div>
            </div>
           )
        })}
      </div>
    </div>
  );
};

export default DebugSection;
