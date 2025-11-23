import React, { useState, useCallback, useEffect } from 'react';
import { Pose, UploadedFile, Quality, DebugInfo, GeneratedImage } from './types';
import { POSES, PERSONAS } from './constants';
import { generateGroupPhoto } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ImagePreview from './components/ImagePreview';
import PoseSelector from './components/PoseSelector';
import QualitySelector from './components/QualitySelector';
import BackgroundUpload from './components/BackgroundUpload';
import Loader from './components/Loader';
import { DownloadIcon, LogoIcon, RefreshIcon, ZoomInIcon, ZipIcon } from './components/icons';
import DebugSection from './components/DebugSection';
import AdBanner from './components/AdBanner';
import { topLeaderboardAds, bottomLeaderboardAds } from './ads';
import { ZGenHeader } from './components/ZGenHeader';
import { ZGenFooter } from './components/ZGenFooter';
import VersionModal from './components/VersionModal';

declare var JSZip: any;

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [backgroundFile, setBackgroundFile] = useState<UploadedFile | null>(null);
  const [selectedPose, setSelectedPose] = useState<Pose | null>(POSES[0]);
  const [quality, setQuality] = useState<Quality>('High');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appName, setAppName] = useState('Group Photo Fusion');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  const [debugInfos, setDebugInfos] = useState<DebugInfo[]>([]);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('');


  useEffect(() => {
    fetch('/metadata.json')
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setAppName(data.name);
        }
      })
      .catch(err => console.error("Could not fetch app name from metadata.json", err));
    
    fetch('/version.json')
      .then(res => res.json())
      .then(data => {
          if (data.version) {
              setAppVersion(data.version);
          }
      })
      .catch(err => console.error("Could not fetch app version", err));
  }, []);

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setGeneratedImages(null);
    setError(null);
    setDebugInfos([]);
  };

  const handleBackgroundChange = (file: UploadedFile) => {
    setBackgroundFile(file);
    setDebugInfos([]);
  };

  const handleRemoveBackground = () => {
    setBackgroundFile(null);
    setDebugInfos([]);
  };

  const handleRemoveImage = (id: string) => {
    setUploadedFiles(prev => prev.filter((f) => f.id !== id));
    setDebugInfos([]);
  };

  const handlePersonaChange = (id: string, personaId: string) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === id ? { ...file, personaId } : file
      )
    );
  };

  const handleRemoveAll = () => {
    setUploadedFiles([]);
    setBackgroundFile(null);
    setGeneratedImages(null);
    setError(null);
    setDebugInfos([]);
  };
  
  const handleGenerate = useCallback(async () => {
    if (!selectedPose || uploadedFiles.length < 2) {
      setError("Please upload 2 to 4 subject photos and select a pose.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const placeholders: GeneratedImage[] = Array(4).fill(0).map(() => ({
        id: crypto.randomUUID(),
        base64: null,
        status: 'generating',
    }));
    setGeneratedImages(placeholders);
    setDebugInfos([]);

    try {
      const subjectFiles = uploadedFiles.map(uf => uf.file);
      const isBackgroundSupported = !(selectedPose?.id === 'cinematic-portrait' || selectedPose?.id === 'professional-bw');
      const backgroundToUse = backgroundFile && isBackgroundSupported ? backgroundFile : null;
      const allFiles = backgroundToUse ? [...subjectFiles, backgroundToUse.file] : subjectFiles;

      const personaDescriptions = uploadedFiles.map(uf => {
        if (uf.personaId) {
            const persona = PERSONAS.find(p => p.id === uf.personaId);
            return persona ? persona.description : '';
        }
        return '';
      });

      const prompt = selectedPose.getPrompt(personaDescriptions, quality, !!backgroundToUse);
      
      const generationPromises = Array(4).fill(0).map(() => generateGroupPhoto(allFiles, prompt));
      const results = await Promise.allSettled(generationPromises);

      const newGeneratedImages: GeneratedImage[] = [...placeholders];
      const newDebugInfos: DebugInfo[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newGeneratedImages[index] = {
            ...newGeneratedImages[index],
            base64: `data:image/jpeg;base64,${result.value.imageBase64}`,
            status: 'success',
          };
          if (isDebugMode) {
            newDebugInfos.push({
              prompt,
              subjects: uploadedFiles,
              background: backgroundToUse,
              quality,
              apiResponseText: result.value.responseText,
              generatedImageBase64: result.value.imageBase64,
            });
          }
        } else {
          newGeneratedImages[index] = {
            ...newGeneratedImages[index],
            base64: null,
            status: 'error',
            error: result.reason instanceof Error ? result.reason.message : "An unknown error occurred.",
          };
        }
      });
      
      setGeneratedImages(newGeneratedImages);
      if (isDebugMode) {
        setDebugInfos(newDebugInfos);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during image generation.");
      setGeneratedImages(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPose, uploadedFiles, quality, backgroundFile, isDebugMode]);

  const handleRetry = useCallback(async (id: string) => {
    setGeneratedImages(prev => prev?.map(img => img.id === id ? { ...img, status: 'generating', error: undefined } : img) || null);
    
    const subjectFiles = uploadedFiles.map(uf => uf.file);
    const isBackgroundSupported = !(selectedPose?.id === 'cinematic-portrait' || selectedPose?.id === 'professional-bw');
    const backgroundToUse = backgroundFile && isBackgroundSupported ? backgroundFile : null;
    const allFiles = backgroundToUse ? [...subjectFiles, backgroundToUse.file] : subjectFiles;
    const personaDescriptions = uploadedFiles.map(uf => {
        if (uf.personaId) {
            const persona = PERSONAS.find(p => p.id === uf.personaId);
            return persona ? persona.description : '';
        }
        return '';
    });
    if (!selectedPose) return;
    const prompt = selectedPose.getPrompt(personaDescriptions, quality, !!backgroundToUse);

    try {
        const result = await generateGroupPhoto(allFiles, prompt);
        setGeneratedImages(prev => prev?.map(img => img.id === id ? {
            ...img,
            base64: `data:image/jpeg;base64,${result.imageBase64}`,
            status: 'success'
        } : img) || null);
        if (isDebugMode) {
            setDebugInfos(prev => [...prev, {
                prompt,
                subjects: uploadedFiles,
                background: backgroundToUse,
                quality,
                apiResponseText: result.responseText,
                generatedImageBase64: result.imageBase64,
            }]);
        }
    } catch(err) {
        setGeneratedImages(prev => prev?.map(img => img.id === id ? {
            ...img,
            status: 'error',
            error: err instanceof Error ? err.message : "An unknown error occurred."
        } : img) || null);
    }
  }, [selectedPose, uploadedFiles, quality, backgroundFile, isDebugMode]);
  
  const handleDownloadAll = async () => {
    if (!generatedImages) return;

    const successfulImages = generatedImages.filter(img => img.status === 'success' && img.base64);
    if (successfulImages.length === 0) return;

    try {
        const zip = new JSZip();
        successfulImages.forEach((image, index) => {
            if (image.base64) {
                const base64Data = image.base64.split(',')[1];
                zip.file(`fusion_${index + 1}.jpg`, base64Data, { base64: true });
            }
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = `${appName.toLowerCase().replace(/\s+/g, '-')}-collection.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch(err) {
        console.error("Failed to create ZIP file", err);
        setError("Could not create ZIP file. Please download images individually.");
    }
  };

  const handleStartOver = () => {
    setGeneratedImages(null);
    setError(null);
    setIsLoading(false);
    setDebugInfos([]);
  };

  const renderAppName = () => {
    const bracketIndex = appName.indexOf('[');
    if (bracketIndex !== -1) {
      const mainName = appName.substring(0, bracketIndex).trim();
      const betaText = appName.substring(bracketIndex);
      return (
        <>
          {mainName} <span className="text-[#E4A0AF]">{betaText}</span>
        </>
      );
    }

    const words = appName.split(' ');
    if (words.length <= 1) {
      return <span className="text-[#E4A0AF]">{appName}</span>;
    }
    const lastWord = words.pop();
    const mainName = words.join(' ');
    return (
      <>
        {mainName} <span className="text-[#E4A0AF]">{lastWord}</span>
      </>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (generatedImages) {
        const successfulGenerations = generatedImages.filter(img => img.status === 'success').length;
        const downloadFilename = `${appName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        return (
        <>
          {zoomedImage && (
            <div 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-zoom-out"
              onClick={() => setZoomedImage(null)}
            >
              <img src={zoomedImage} alt="Generated group photo - zoomed" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          )}
          <div className="w-full max-w-5xl text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Your Fused Photos are Ready!</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative group aspect-square bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
                  {image.status === 'success' && image.base64 && (
                    <img src={image.base64} alt="Generated group photo" className="w-full h-full object-cover" />
                  )}
                  {image.status === 'generating' && (
                     <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 border-2 border-dashed rounded-full animate-spin border-[#E4A0AF]"></div>
                        <p className="text-sm text-gray-400 mt-2">Generating...</p>
                    </div>
                  )}
                   {image.status === 'error' && (
                    <div className="p-4 text-center">
                        <p className="text-red-400 font-semibold">Generation Failed</p>
                        <p className="text-xs text-red-400/80 mt-1">{image.error}</p>
                    </div>
                   )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    {image.status === 'success' && image.base64 && (
                      <>
                        <button 
                            onClick={() => setZoomedImage(image.base64)}
                            className="text-white rounded-full p-3 bg-black/50 hover:bg-black/80"
                            aria-label="Zoom in on image"
                        >
                            <ZoomInIcon className="h-6 w-6" />
                        </button>
                        <a
                          href={image.base64}
                          download={`${downloadFilename.replace('.jpg', '')}-${image.id.substring(0,4)}.jpg`}
                          className="text-white rounded-full p-3 bg-black/50 hover:bg-black/80"
                          aria-label="Download image"
                        >
                          <DownloadIcon className="h-6 w-6" />
                        </a>
                      </>
                    )}
                     {image.status === 'error' && (
                        <button 
                            onClick={() => handleRetry(image.id)}
                            className="text-white rounded-full p-3 bg-black/50 hover:bg-black/80"
                            aria-label="Retry generation"
                        >
                            <RefreshIcon className="h-6 w-6" />
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
               <button
                onClick={handleDownloadAll}
                disabled={successfulGenerations === 0}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-[#E4A0AF] hover:bg-[#D88FA0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#E4A0AF] disabled:bg-[#F0C0CB]/50 disabled:cursor-not-allowed"
              >
                <ZipIcon className="h-5 w-5 mr-2" />
                Download All (.zip)
              </button>
              <button
                onClick={handleStartOver}
                className="inline-flex items-center px-6 py-3 border border-[#E4A0AF] text-base font-medium rounded-md shadow-sm text-[#E4A0AF] bg-transparent hover:bg-[#E4A0AF]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#E4A0AF]"
              >
                <RefreshIcon className="h-5 w-5 mr-2" />
                Start Over
              </button>
            </div>
          </div>
        </>
      );
    }

    if (uploadedFiles.length > 0) {
      const isBackgroundDisabled = selectedPose?.id === 'cinematic-portrait' || selectedPose?.id === 'professional-bw';
      return (
        <div className="w-full">
          <ImagePreview files={uploadedFiles} onRemove={handleRemoveImage} onPersonaChange={handlePersonaChange} onRemoveAll={handleRemoveAll} />
          <div className="space-y-8 mt-8">
            <BackgroundUpload
              backgroundFile={backgroundFile}
              onBackgroundChange={handleBackgroundChange}
              onRemoveBackground={handleRemoveBackground}
              isDisabled={isBackgroundDisabled}
            />
            <PoseSelector 
              poses={POSES} 
              selectedPose={selectedPose} 
              onSelectPose={setSelectedPose}
              numFiles={uploadedFiles.length}
            />
            <QualitySelector selectedQuality={quality} onSelectQuality={setQuality} />
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedPose || uploadedFiles.length < 2 || uploadedFiles.length > 4}
              className="px-8 py-4 bg-[#E4A0AF] text-black font-bold rounded-lg shadow-lg hover:bg-[#D88FA0] disabled:bg-[#F0C0CB] disabled:cursor-not-allowed transition-colors duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Generating...' : '✨ Fuse Photos'}
            </button>
          </div>
        </div>
      );
    }
    
    return <FileUpload onFilesChange={handleFilesChange} />;
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mx-auto flex flex-col items-center mb-6 sm:mb-10">
        <div className="flex items-center justify-center">
          <LogoIcon className="h-12 w-12 mr-3" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {renderAppName()}
          </h1>
        </div>
        <ZGenHeader />
      </header>

      {topLeaderboardAds.length > 0 && <AdBanner ad={topLeaderboardAds[0]} />}

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-center">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 w-full max-w-2xl" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {renderContent()}
        {isDebugMode && debugInfos.length > 0 && <DebugSection debugInfos={debugInfos} />}
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center mt-10 text-gray-500 text-sm">
        {bottomLeaderboardAds.length > 0 && <AdBanner ad={bottomLeaderboardAds[0]} />}
        <ZGenFooter />
         <div className="mt-4">
            <label className="flex items-center justify-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDebugMode}
                onChange={() => setIsDebugMode(prev => !prev)}
                className="form-checkbox h-5 w-5 text-[#E4A0AF] bg-zinc-800 border-zinc-600 rounded focus:ring-[#E4A0AF]"
              />
              <span className="text-gray-400">Enable Debug Mode</span>
            </label>
        </div>
        <div className="mt-4">
            <button 
              onClick={() => setIsVersionModalOpen(true)}
              className="text-xs hover:underline text-gray-500 hover:text-[#E4A0AF] transition-colors"
            >
              {appVersion ? `Version ${appVersion}` : 'Version History'}
            </button>
        </div>
      </footer>
      {isVersionModalOpen && <VersionModal onClose={() => setIsVersionModalOpen(false)} />}
    </div>
  );
};

export default App;