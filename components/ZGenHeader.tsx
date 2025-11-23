// components/ZGenHeader.tsx

import React from 'react';

// Data for the app links is stored directly in the component for portability.
const zGenApps = [
    { 
        name: 'InstaMeme Generator', 
        url: 'https://ai.studio/apps/drive/12d9lkTyUpsW6RIK0PUTUu1g4OktC3HUM' 
    },
    { 
        name: 'Snapchat Generator', 
        url: 'https://ai.studio/apps/drive/1nwkCHVk9YtueBc_yv1pFr325IwZTpUPU' 
    },
    { 
        name: 'E-commerce Clothing Extractor', 
        url: 'https://ai.studio/apps/drive/1U9xDutUGtL6m2z45iI0YWUnnR5l2pTXh' 
    },
    { 
        name: 'Portrait Generator', 
        url: 'https://ai.studio/apps/drive/1SxFaWlHKmhJ3IQ9eFXFRH_YvydfcXrkC' 
    },
    { 
        name: 'Garment Grabber', 
        url: 'https://ai.studio/apps/drive/1VH9w6Ffurr-IsK03bQ6uEQtnoQfJxJ5N' 
    },
];

export const ZGenHeader: React.FC = () => {
  return (
    // This container provides the border and padding.
    <div className="w-full mt-3 pt-2 border-t border-zinc-700">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Explore other zGenMedia apps:
        </h2>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {zGenApps.map((app) => (
                <a 
                    key={app.name}
                    href={app.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-cyan-400 hover:underline font-medium"
                >
                    {app.name}
                </a>
            ))}
        </nav>
    </div>
  );
};