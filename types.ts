export type Equipment = 'None/Bodyweight' | 'Dumbbells' | 'Kettlebell' | 'Barbell' | 'Jump Rope' | 'Pull-up Bar' | 'Box' | 'Bench' | 'Rower' | 'Bike' | 'Medicine Ball' | 'Rings';
export type TimeDomain = 'Very Short (<10m)' | 'Short (10-20m)' | 'Medium (20-30m)' | 'Long (30-45m)' | 'Very Long (45m+)';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
export type Focus = 'Cardio' | 'Strength' | 'Gymnastics' | 'Full Body';
export type BodyPartEmphasis = 'Upper Body' | 'Lower Body' | 'Core' | 'Pushing' | 'Pulling' | 'Legs/Glutes' | 'Shoulders' | 'Back';
export type RunningSpace = 'None (Indoor Only)' | 'Small Space (Shuttles)' | 'Open Road/Track';
export type WorkoutStructure = 'For Time' | 'AMRAP' | 'EMOM (Varied)' | 'Intervals / Work-Rest' | 'Chipper' | 'Any';

export interface FilterState {
  equipment: Equipment[];
  equipmentWeights: {
    dumbbells: string;
    kettlebell: string;
    barbell: string;
  };
  time: TimeDomain;
  difficulty: Difficulty;
  focus: Focus[];
  bodyParts: BodyPartEmphasis[];
  runningSpace: RunningSpace;
  minRating: number;
  structure: WorkoutStructure;
}

export interface Workout {
  id: string;
  name: string;
  type: string;
  description: string;
  timeEstimate: string;
  equipmentNeeded: string[];
  difficulty: string;
  focus: string;
  tips: string;
  isBenchmark: boolean;
  userRating?: number; // 0-5
  averageRating?: number;
  reviewCount?: number;
}

export interface CompletedWorkout {
  historyId: string;
  workout: Workout;
  completedAt: string;
  rating?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  joinDate: string;
  workoutsCompleted: number;
}

export interface GenerateResponse {
  workouts: Workout[];
}