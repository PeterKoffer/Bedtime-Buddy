export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    language: 'en' | 'da';
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Vision-extracted traits for likeness preservation
export interface CharacterTraits {
  ageRange: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  freckles: boolean;
  accessories: string[];
  notableMarks: string[];
  genderGuess: string;
}

export type GenderOption = 'girl' | 'boy' | 'non-binary' | 'unspecified';

export interface Character {
  id: string;
  name: string;
  description: string;
  photos: string[]; // Array of base64 encoded photos (3-4 photos)
  cartoonImage?: string;
  personality: string[];
  age: number;
  appearance: string;
  selectedGender?: GenderOption;
  avatarGenerated?: boolean; // Flag to track if AI avatar was generated
  createdAt: Date;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  style: string;
  keywords: string[];
  character: Character;
  images: string[];
  userId: string;
  createdAt: string;
  language: 'en' | 'da';
}

export interface StoryTheme {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface StoryStyle {
  id: string;
  name: string;
  description: string;
  example: string;
}

export interface StoryGenerationData {
  character: Character;
  theme: string;
  style: string;
  keywords: string[];
  language: 'en' | 'da';
}