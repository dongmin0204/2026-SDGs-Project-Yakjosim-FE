import React, { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type {
  UserProfile,
  SavedMedicine,
  SavedSupplement,
  SavedSession,
  Medicine,
  SupplementIngredient,
  AnalysisSession,
} from '@/types';

// ── State ──
interface UserState {
  profile: UserProfile;
  hasCompletedOnboarding: boolean;
  savedMedicines: SavedMedicine[];
  savedSupplements: SavedSupplement[];
  savedSessions: SavedSession[];
  // CSS support exists in styles/globals.css via `:root[data-senior="true"]`,
  // but the app shell still needs to sync this flag onto the root element.
  seniorMode: boolean;
}

const USER_STORAGE_KEY = 'yak-josim-user-state';

const initialState: UserState = {
  profile: {
    birthDate: undefined,
    birthYear: undefined,
    sex: undefined,
    isPregnant: false,
    isElderly: false,
    chronicConditions: [],
  },
  hasCompletedOnboarding: false,
  savedMedicines: [],
  savedSupplements: [],
  savedSessions: [],
  seniorMode: false,
};

// ── Actions ──
type UserAction =
  | { type: 'SET_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SET_SENIOR_MODE'; payload: boolean }
  | { type: 'SAVE_MEDICINE'; payload: Medicine }
  | { type: 'REMOVE_SAVED_MEDICINE'; payload: string }
  | { type: 'SAVE_SUPPLEMENT'; payload: SupplementIngredient }
  | { type: 'REMOVE_SAVED_SUPPLEMENT'; payload: string }
  | { type: 'SAVE_SESSION'; payload: AnalysisSession }
  | { type: 'TOGGLE_SENIOR_MODE' };

function createStableId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function hydrateUserState(): UserState {
  if (typeof window === 'undefined') {
    return initialState;
  }

  const storedState = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!storedState) {
    return initialState;
  }

  try {
    const parsedState = JSON.parse(storedState) as Partial<UserState>;

    return {
      ...initialState,
      ...parsedState,
      profile: {
        ...initialState.profile,
        ...parsedState.profile,
      },
      savedMedicines: (parsedState.savedMedicines ?? []).map((saved) => ({
        ...saved,
        addedAt: new Date(saved.addedAt),
      })),
      savedSupplements: (parsedState.savedSupplements ?? []).map((saved) => ({
        ...saved,
        addedAt: new Date(saved.addedAt),
      })),
      savedSessions: (parsedState.savedSessions ?? []).map((saved) => ({
        ...saved,
        savedAt: new Date(saved.savedAt),
        session: {
          ...saved.session,
          createdAt: new Date(saved.session.createdAt),
        },
      })),
      seniorMode: Boolean(parsedState.seniorMode),
      hasCompletedOnboarding: Boolean(parsedState.hasCompletedOnboarding),
    };
  } catch {
    return initialState;
  }
}

function getAgeFromBirthDate(birthDate?: string): number | null {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  const date = new Date(birthDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
}

function deriveProfile(profile: UserProfile): UserProfile {
  const age = getAgeFromBirthDate(profile.birthDate);
  const birthYear = profile.birthDate
    ? new Date(profile.birthDate).getFullYear()
    : profile.birthYear;

  return {
    ...profile,
    birthYear,
    isElderly: age !== null ? age >= 65 : profile.isElderly,
  };
}

// ── Reducer ──
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_PROFILE':
      return {
        ...state,
        profile: deriveProfile({ ...state.profile, ...action.payload }),
      };

    case 'COMPLETE_ONBOARDING':
      return { ...state, hasCompletedOnboarding: true };

    case 'SET_SENIOR_MODE':
      return { ...state, seniorMode: action.payload };

    case 'SAVE_MEDICINE': {
      if (state.savedMedicines.some((sm) => sm.medicine.id === action.payload.id)) {
        return state;
      }
      const newSaved: SavedMedicine = {
        id: createStableId('saved-med'),
        medicine: action.payload,
        addedAt: new Date(),
      };
      return { ...state, savedMedicines: [...state.savedMedicines, newSaved] };
    }

    case 'REMOVE_SAVED_MEDICINE':
      return {
        ...state,
        savedMedicines: state.savedMedicines.filter((sm) => sm.id !== action.payload),
      };

    case 'SAVE_SUPPLEMENT': {
      if (state.savedSupplements.some((saved) => saved.supplement.id === action.payload.id)) {
        return state;
      }
      const newSavedSupplement: SavedSupplement = {
        id: createStableId('saved-sup'),
        supplement: action.payload,
        addedAt: new Date(),
      };
      return {
        ...state,
        savedSupplements: [...state.savedSupplements, newSavedSupplement],
      };
    }

    case 'REMOVE_SAVED_SUPPLEMENT':
      return {
        ...state,
        savedSupplements: state.savedSupplements.filter((saved) => saved.id !== action.payload),
      };

    case 'SAVE_SESSION': {
      const newSession: SavedSession = {
        id: createStableId('saved-sess'),
        session: action.payload,
        savedAt: new Date(),
      };
      return { ...state, savedSessions: [...state.savedSessions, newSession] };
    }

    case 'TOGGLE_SENIOR_MODE':
      return { ...state, seniorMode: !state.seniorMode };

    default:
      return state;
  }
}

// ── Context ──
interface UserContextValue {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
}

const UserContext = createContext<UserContextValue | null>(null);

// ── Provider ──
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState, hydrateUserState);

  useEffect(() => {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.senior = String(state.seniorMode);

    return () => {
      delete document.documentElement.dataset.senior;
    };
  }, [state.seniorMode]);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

// ── Hook ──
export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return ctx;
}
