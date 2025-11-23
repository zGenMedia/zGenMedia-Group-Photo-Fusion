// FIX: Removed 'ContentPart' from the '@google/genai' import because it is not an exported member.
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { GeneratePhotoResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error("Failed to read file as data URL."));
        return;
      }
      const dataUrl = reader.result as string;
      const base64String = dataUrl.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => {
        reject(error);
    };
    reader.readAsDataURL(file);
  });

  const base64String = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64String,
      mimeType: file.type,
    },
  };
};

export const generateGroupPhoto = async (files: File[], prompt: string): Promise<GeneratePhotoResult> => {
  if (files.length < 2 || files.length > 5) {
    throw new Error("Please provide 2 to 4 subject images, with an optional background.");
  }
  
  try {
    const imageParts = await Promise.all(files.map(fileToGenerativePart));
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      if (response.promptFeedback?.blockReason) {
          throw new Error(`Request was blocked due to ${response.promptFeedback.blockReason}.`);
      }
      throw new Error("The model did not return any content. This could be due to a safety filter.");
    }

    const candidate = response.candidates[0];
    let responseText = "No text response from model.";
    
    if (candidate.content && candidate.content.parts) {
        const imagePart = candidate.content.parts.find(part => part.inlineData);
        const textPart = candidate.content.parts.find(part => part.text);

        if (textPart && textPart.text) {
            responseText = textPart.text;
        }

        if (imagePart && imagePart.inlineData) {
            return {
              imageBase64: imagePart.inlineData.data,
              responseText: responseText,
            };
        }
    }
    
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Image generation failed. Reason: ${candidate.finishReason}.`);
    }

    throw new Error("No image was generated. The model may have refused the request.");

  } catch (error) {
    console.error(`Image generation failed:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
        throw new Error("Image generation failed due to safety filters. Please try different images or a less sensitive scenario.");
    }
    throw new Error(`Gemini API Error: ${errorMessage}`);
  }
};