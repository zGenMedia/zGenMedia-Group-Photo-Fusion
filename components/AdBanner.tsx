// components/AdBanner.tsx

import React from 'react';
// Make sure to import the Ad interface from your data file
import type { Ad } from '../ads';

interface AdBannerProps {
    ad: Ad;
}

const AdBanner: React.FC<AdBannerProps> = ({ ad }) => {
    // This component renders a clickable link that contains the ad image.
    // It uses Tailwind CSS for styling.
    return (
        <div className="w-full max-w-5xl mx-auto my-4">
            <a 
                href={ad.linkUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block overflow-hidden rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300"
            >
                <img 
                    src={ad.imageUrl} 
                    alt="Advertisement" 
                    className="w-full h-auto object-contain"
                />
            </a>
        </div>
    );
};

export default AdBanner;
