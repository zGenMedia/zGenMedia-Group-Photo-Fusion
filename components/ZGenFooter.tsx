// components/ZGenFooter.tsx

import React from 'react';

export const ZGenFooter: React.FC = () => {
    return (
        // Changed from <footer> to <div> to avoid nesting inside another footer.
        <div className="text-center p-4 text-gray-500 text-xs">
            <p className="mt-4">
                Based off of Replicate's flux-kontext-apps/portrait-series. Thank you everyone that supports us on our group (
                <a 
                    href="https://www.facebook.com/groups/alrevolutionmidjourneydalle2stablediffusion" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-cyan-400 hover:underline"
                >
                    join here
                </a>
                ).
            </p>
            <p>
                If you have any issues or want an app of your own make a request on our fb or our socials. We are ©zgenmedia everywhere and blkcosmo.com
            </p>
        </div>
    );
};
