import React from 'react';
import { Pose } from '../types';

interface PoseSelectorProps {
  poses: Pose[];
  selectedPose: Pose | null;
  onSelectPose: (pose: Pose) => void;
  numFiles: number;
}

const PoseSelector: React.FC<PoseSelectorProps> = ({ poses, selectedPose, onSelectPose, numFiles }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">Choose a Scenario</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {poses.map((pose) => {
          const isDisabled = pose.id === 'kissing-booth' && numFiles !== 2;
          const isSelected = selectedPose?.id === pose.id;
          return (
            <button
              key={pose.id}
              onClick={() => onSelectPose(pose)}
              disabled={isDisabled}
              className={`p-4 rounded-lg text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-[#E4A0AF] ring-2 ring-offset-2 ring-offset-black ring-[#E4A0AF] shadow-lg'
                  : 'bg-zinc-900 hover:bg-zinc-800'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isDisabled ? 'This pose requires exactly 2 subjects.' : pose.description}
            >
              <h3 className={`font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{pose.title}</h3>
              <p className={`text-sm ${isSelected ? 'text-zinc-800' : 'text-gray-400'} mt-1`}>{pose.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PoseSelector;