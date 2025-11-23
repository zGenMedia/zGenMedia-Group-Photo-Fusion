import React from 'react';
import { Quality } from '../types';

interface QualitySelectorProps {
  selectedQuality: Quality;
  onSelectQuality: (quality: Quality) => void;
}

const QUALITIES: { id: Quality; title: string; description: string }[] = [
  {
    id: 'Standard',
    title: 'Standard',
    description: 'Good quality, fast generation.',
  },
  {
    id: 'High',
    title: 'High',
    description: 'Great quality and detail.',
  },
  {
    id: 'Ultra High',
    title: 'Ultra High',
    description: 'Maximum realism and sharpness.',
  },
];

const QualitySelector: React.FC<QualitySelectorProps> = ({ selectedQuality, onSelectQuality }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">Choose an Image Quality</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUALITIES.map((quality) => {
          const isSelected = selectedQuality === quality.id;
          return (
            <button
              key={quality.id}
              onClick={() => onSelectQuality(quality.id)}
              className={`p-4 rounded-lg text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-[#E4A0AF] ring-2 ring-offset-2 ring-offset-black ring-[#E4A0AF] shadow-lg'
                  : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              <h3 className={`font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{quality.title}</h3>
              <p className={`text-sm ${isSelected ? 'text-zinc-800' : 'text-gray-400'} mt-1`}>{quality.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QualitySelector;