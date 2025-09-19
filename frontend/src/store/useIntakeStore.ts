import { create } from 'zustand';
import type { Intake, Priorities } from '@/lib/graph';

interface IntakeState {
  intake: Intake;
  currentStep: number;
  setProductType: (type: Intake['productType']) => void;
  setTechStack: (techStack: Intake['techStack']) => void;
  setTechStackField: (field: keyof Intake['techStack'], value: string) => void;
  setPriorities: (priorities: Priorities) => void;
  setPriority: (key: keyof Priorities, value: number) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
  isComplete: () => boolean;
}

const defaultPriorities: Priorities = {
  security: 5,
  scalability: 5,
  cost: 5,
  latency: 5,
  developer_experience: 5,
  availability: 5,
};

const defaultIntake: Intake = {
  productType: 'webapp',
  techStack: {
    frontend: '',
    backend: '',
    database: '',
    authentication: '',
    other: '',
  },
  priorities: defaultPriorities,
};

export const useIntakeStore = create<IntakeState>((set, get) => ({
  intake: defaultIntake,
  currentStep: 0,

  setProductType: (productType) =>
    set((state) => ({
      intake: { ...state.intake, productType },
    })),

  setTechStack: (techStack) =>
    set((state) => ({
      intake: { ...state.intake, techStack },
    })),

  setTechStackField: (field, value) =>
    set((state) => ({
      intake: {
        ...state.intake,
        techStack: { ...state.intake.techStack, [field]: value },
      },
    })),

  setPriorities: (priorities) =>
    set((state) => ({
      intake: { ...state.intake, priorities },
    })),

  setPriority: (key, value) =>
    set((state) => ({
      intake: {
        ...state.intake,
        priorities: { ...state.intake.priorities, [key]: value },
      },
    })),

  setCurrentStep: (currentStep) => set({ currentStep }),

  reset: () => set({ intake: defaultIntake, currentStep: 0 }),

  isComplete: () => {
    const { intake } = get();
    return !!(intake.techStack.frontend || intake.techStack.backend);
  },
}));