import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Analyzing individual photos...",
    "Understanding identities and clothing...",
    "Composing the scene...",
    "Adjusting lighting and shadows...",
    "Rendering the final image...",
    "Almost there..."
];

const Loader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#E4A0AF]"></div>
            <h2 className="text-2xl font-bold text-white mt-6">Fusing Photos...</h2>
            <p className="text-gray-400 mt-2">{loadingMessages[messageIndex]}</p>
        </div>
    );
};

export default Loader;