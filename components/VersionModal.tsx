// components/VersionModal.tsx

import React, { useState, useEffect, useCallback } from 'react';
// This modal depends on icons. Ensure you have these available in your project.
import { SpinnerIcon, XIcon as CloseIcon } from './icons'; // Using XIcon as CloseIcon

interface VersionModalProps {
  onClose: () => void;
}

const VersionModal: React.FC<VersionModalProps> = ({ onClose }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function fetches the version data when the component is first rendered.
    const fetchVersionHistory = async () => {
      try {
        const response = await fetch('/version.json'); // Fetches from the public root
        if (!response.ok) {
          throw new Error(`Failed to fetch version history: ${response.statusText}`);
        }
        const data = await response.json();
        setContent(data.description);
      } catch (err: any) {
        setError(err.message || 'Could not load version history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersionHistory();
  }, []);
  
  // Add an event listener to close the modal when the 'Escape' key is pressed.
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent the page behind the modal from scrolling.
    document.body.style.overflow = 'hidden';

    // Cleanup function to remove the event listener and restore scrolling.
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  return (
    // The modal backdrop
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose} // Close the modal if the backdrop is clicked
    >
      {/* The modal content panel */}
      <div 
        className="bg-zinc-900/95 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border border-zinc-700"
        onClick={e => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#E4A0AF]">Version History</h2>
          <button
            onClick={onClose}
            className="bg-zinc-800 text-white rounded-full p-2 hover:bg-zinc-700 transition-colors"
            aria-label="Close version history"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <SpinnerIcon className="w-8 h-8 animate-spin text-[#E4A0AF]" />
            </div>
          ) : error ? (
            <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
          ) : (
            // Using <pre> preserves the line breaks from your version.json
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">
              {content}
            </pre>
          )}
        </main>
      </div>
    </div>
  );
};

export default VersionModal;
