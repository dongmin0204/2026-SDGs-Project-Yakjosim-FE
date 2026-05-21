import type { Medicine, AnalysisSession, SupplementIngredient } from './index';

export type Sex = 'male' | 'female' | 'other';

export interface UserProfile {
  birthDate?: string;
  birthYear?: number;
  sex?: Sex;
  isPregnant: boolean;
  isElderly: boolean;
  chronicConditions: string[];
}

export interface SavedMedicine {
  id: string;
  medicine: Medicine;
  addedAt: Date;
}

export interface SavedSupplement {
  id: string;
  supplement: SupplementIngredient;
  addedAt: Date;
}

export interface SavedSession {
  id: string;
  session: AnalysisSession;
  savedAt: Date;
}
