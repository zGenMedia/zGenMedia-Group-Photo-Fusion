import { Pose, Persona, Quality } from './types';

const TEST_MODE = false; // This is a temporary flag for testing. Set to false to restore full prompt generation.

const getQualityText = (quality: Quality): string => {
  switch (quality) {
    case 'Standard':
      return 'a clear, photorealistic image.';
    case 'High':
      return 'a very detailed, photorealistic, high-resolution image.';
    case 'Ultra High':
      return 'a hyper-realistic, professional-grade photograph with maximum detail.';
  }
};

const SAFETY_INSTRUCTION = `\n\n**Safety Constraint:** The generated image must be strictly safe-for-work (SFW). All individuals must be depicted as fully and modestly clothed. All poses and interactions must be wholesome and platonic.`;


const createPrompt = (
    poseDescription: string,
    compositionDetails: string,
    personaDescriptions: string[],
    quality: Quality,
    hasBackground: boolean
) => {
    const numSubjects = personaDescriptions.length;
    const subjectStrings = ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4'];

    // Build the list of subjects for the intro sentence
    let subjectList = subjectStrings.slice(0, numSubjects).join(', ');
    if (numSubjects > 1) {
        const lastCommaIndex = subjectList.lastIndexOf(',');
        if (lastCommaIndex !== -1) {
             subjectList = subjectList.substring(0, lastCommaIndex) + ' and' + subjectList.substring(lastCommaIndex + 1);
        }
    }
    
    // 1. Core Instruction
    let prompt = `Take ${subjectList}`;
    if (hasBackground) {
        prompt += ` and place them in the background image.`;
    }
    prompt += ` The subjects should be posed ${poseDescription}.`;

    // If in test mode, return the simplified prompt immediately.
    if (TEST_MODE) {
        return prompt;
    }
    
    // 2. Dynamic, Per-Subject Instructions for body modification
    const personaInjections = personaDescriptions.map((desc, index) => {
        if (!desc || desc.trim() === '' || desc.startsWith('Use the body characteristics')) return null;
        
        return `\n- **For ${subjectStrings[index]}**: Reshape their body to match the following description: "${desc}". This instruction applies ONLY to the body shape.`;

    }).filter(Boolean).join('');

    if (personaInjections) {
         prompt += `\n\n**Subject Body Modifications:**${personaInjections}`;
    }

    // 3. Final Critical Instructions Block
    prompt += `\n\n**Critical Instructions:**`;
    prompt += `\n- **Absolute Identity Preservation:** You MUST preserve the exact face, identity, and hairstyle for each subject from their source photo. This is the highest priority. The body reshaping instructions above MUST NOT alter their facial features.`;
    prompt += `\n- **Clothing Preservation & Failsafe:** Preserve the clothing from the source photos. If a subject's clothing is not fully visible or is ambiguous, you MUST render them in simple, dark-colored casual wear (e.g., a black t-shirt and dark jeans). This is a strict rule to prevent inventing outfits that could alter the subject's identity.`;
    prompt += `\n- **Composition & Realism:** ${compositionDetails}. The pose must be natural, with perfectly consistent lighting, shadows, and perspective between all subjects and the background.`;
    prompt += `\n- **Quality:** The final result must be ${getQualityText(quality)}`;
    
    if (hasBackground) {
        prompt += `\n\n### MANDATE #A: BACKGROUND & PHOTOREALISM
Integrate the subjects seamlessly into the provided background.
Match lighting direction, shadow sharpness, and color temperature.
Match grain, focus, and depth of field.
Apply consistent color grading.
The final output must look like a single photograph, indistinguishable of any edits.

### MANDATE #B: SCALE & COMPOSITION
Characters must be proportional to objects in the background (doors, furniture, etc.).
Feet must rest naturally on a plausible surface.
Subject must be centered logically in frame.`;
    } else {
        prompt += `\n- **PHOTOREALISM:** The image must be **hyper-photorealistic**, indistinguishable from a high-end commercial photograph.`;
    }
    
    prompt += SAFETY_INSTRUCTION;
    
    return prompt;
};

export const POSES: Pose[] = [
  {
    id: 'group-photo',
    title: 'Classic Group Photo',
    description: 'A standard pose where everyone is looking at the camera, smiling.',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        return createPrompt(
            'in a classic group photo layout, smiling and looking at the camera',
            'Arrange all subjects in a standard group photo layout',
            personaDescriptions, quality, hasBackground
        );
    }
  },
  {
    id: 'hug-pose',
    title: 'Reunion Hug',
    description: 'An emotional scene of friends reuniting with a warm hug.',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        return createPrompt(
            'in a warm, emotional group hug, as if reuniting after a long time',
            'This should be a close up photo. Their expressions should be joyous and genuine',
            personaDescriptions, quality, hasBackground
        );
    }
  },
  {
    id: 'intimate-scene',
    title: 'Quiet Moment',
    description: 'A close, personal moment capturing a deep, friendly connection.',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        return createPrompt(
            'sitting closely together, sharing a quiet, friendly moment. They are looking at each other with warm, platonic affection',
            'Arrange the subjects close together in a comfortable, relaxed way. Their interaction should feel genuine, not posed for the camera',
            personaDescriptions, quality, hasBackground
        );
    }
  },
  {
    id: 'candid-moment',
    title: 'Candid Moment',
    description: 'A natural, unposed interaction, as if caught in the moment.',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        return createPrompt(
            'interacting naturally with each other, as if caught in a candid moment',
            'Subjects should be laughing or talking, not looking at the camera',
            personaDescriptions, quality, hasBackground
        );
    }
  },
  {
    id: 'nightclub-photo',
    title: 'Atmospheric Photo',
    description: 'A spontaneous photo taken in a dark, atmospheric setting.',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        const composition = 'The lighting on the subjects must be dim and moody, consistent with the environment. Crucially, they should appear illuminated *only* by the ambient light of the dark setting, avoiding any bright, artificial lighting directly on them.' + (hasBackground ? ' The background lighting should match this dim, moody, and atmospheric style.' : ' The setting should be a dark, atmospheric place like a lounge or cafe at night.');
        return createPrompt(
            'in a spontaneous, atmospheric photo taken without a flash',
            composition,
            personaDescriptions, quality, hasBackground
        );
    }
  },
  {
    id: 'lying-down',
    title: 'Cloud Gazing',
    description: 'A cozy, top-down view of friends lying on a blanket and looking up.',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        const composition = 'The camera angle is directly from above. They should be close together in a comfortable state.' + (hasBackground ? " Crucially, you MUST adjust the background's perspective to a matching top-down view." : ' The setting is a cozy, dimly lit room.');
        return createPrompt(
            'lying on their backs on a large blanket, side-by-side and looking up, as if watching clouds. The view is from a top-down perspective',
            composition,
            personaDescriptions, quality, hasBackground
        );
    }
  },
  {
    id: 'kissing-booth',
    title: 'Kissing Booth',
    description: 'A close-up, high-quality studio shot of a playful, affectionate moment. (Requires 2 subjects)',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        const composition = 'This is a professional studio shot. Their faces must take up about 75% of the frame. Ensure sharp details and beautiful lighting.' + (hasBackground ? ' Maintain high-quality studio lighting on the subjects.' : ' The background should be simple, dark, and heavily out-of-focus to ensure all attention remains on the couple.');
        return createPrompt(
            'in a playful and affectionate moment, with one person giving the other a gentle kiss on the lips.',
            composition,
            personaDescriptions, 'Ultra High', hasBackground
        );
    }
  },
  {
    id: 'photo-booth',
    title: 'Photo Booth',
    description: 'A 3x3 grid of photo strips with different fun poses and expressions.',
    getPrompt: (personaDescriptions, quality, hasBackground) => {
        const composition = 'The final image must be a 3x3 grid of photo strips. The overall image should have a slight blur and a consistent light source, like a camera flash in a dark room.' + (hasBackground ? ' This background should be visible behind the subjects in each photo strip.' : ' The background behind the subjects in each photo strip must be a simple white curtain.');
        return createPrompt(
            'in a series of fun, studio-style poses and expressions',
            composition,
            personaDescriptions, quality, hasBackground
        );
    }
  },
  {
    id: 'cinematic-portrait',
    title: 'Cinematic Portrait',
    description: 'A dramatic, high-contrast portrait with a bold red background.',
    getPrompt: (personaDescriptions, quality, hasBackground) => { 
        return createPrompt(
            'in a dramatic, high-contrast vertical portrait with stark cinematic lighting',
            'Subjects should wear dark, simple wardrobe. Capture them from a slightly low, upward-facing angle to dramatize their features, evoking quiet dominance and sculptural elegance. The background must be a deep, saturated crimson red.',
            personaDescriptions, quality, false
        );
    }
  },
  {
    id: 'professional-bw',
    title: 'Professional B&W',
    description: 'A striking, top-angle black and white headshot with a dark background.',
    getPrompt: (personaDescriptions, quality, hasBackground) => { 
        return createPrompt(
            'in a formal, top-angle, close-up black and white portrait',
            'The style must be a 35mm lens look. Focus on their heads, upper chests, and shoulders. Each person must have a proud expression and face forward, not interacting. The background must be a deep black shadow.',
            personaDescriptions, 'Ultra High', false
        );
    }
  },
];

export const PERSONAS: Persona[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Use the body characteristics as depicted in the subject image without modifications.',
    },
    {
        id: 'female-triangle-pear',
        name: 'Triangle (Pear)',
        description: 'Narrow shoulders, small bust, wide hips and thighs, fuller lower body.',
        type: 'female',
    },
    {
        id: 'female-inverted-triangle',
        name: 'Inverted Triangle',
        description: 'Broad shoulders, fuller chest, narrow waist, slim hips and legs.',
        type: 'female',
    },
    {
        id: 'female-rectangle',
        name: 'Rectangle',
        description: 'Straight torso, even proportions, minimal waist curve, balanced bust and hips.',
        type: 'female',
    },
    {
        id: 'female-oval-apple',
        name: 'Oval (Apple)',
        description: 'Full midsection, soft waist, narrower hips, rounded body shape.',
        type: 'female',
    },
    {
        id: 'female-hourglass',
        name: 'Hourglass',
        description: 'Narrow waist, balanced bust and hips, curvy proportions.',
        type: 'female',
    },
    {
        id: 'female-triangle-alternate',
        name: 'Triangle (alternate)',
        description: 'Small upper body, large hips and thighs, strong lower frame.',
        type: 'female',
    },
    {
        id: 'female-voluptuous-hourglass',
        name: 'Voluptuous (Thick Hourglass)',
        description: 'Large chest and hips, thick thighs, soft belly, strong curves, athletic-to-plus build.',
        type: 'female',
    },
    {
        id: 'male-ectomorph',
        name: 'Ectomorph',
        description: 'Lean and slender, long limbs, narrow shoulders, low muscle mass.',
        type: 'male',
    },
    {
        id: 'male-mesomorph',
        name: 'Mesomorph',
        description: 'Athletic build, broad shoulders, narrow waist, defined muscles.',
        type: 'male',
    },
    {
        id: 'male-endomorph',
        name: 'Endomorph',
        description: 'Rounder body, wider waist and hips, soft muscle definition.',
        type: 'male',
    }
];