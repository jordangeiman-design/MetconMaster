import { Equipment, TimeDomain, Difficulty, Focus, RunningSpace, BodyPartEmphasis, WorkoutStructure } from './types';

export const EQUIPMENT_OPTIONS: Equipment[] = [
  'None/Bodyweight',
  'Dumbbells',
  'Kettlebell',
  'Barbell',
  'Jump Rope',
  'Pull-up Bar',
  'Box',
  'Bench',
  'Rower',
  'Bike',
  'Medicine Ball',
  'Rings'
];

export const TIME_OPTIONS: TimeDomain[] = [
  'Very Short (<10m)',
  'Short (10-20m)',
  'Medium (20-30m)',
  'Long (30-45m)',
  'Very Long (45m+)'
];

export const DIFFICULTY_OPTIONS: Difficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Elite'
];

export const FOCUS_OPTIONS: Focus[] = [
  'Cardio',
  'Strength',
  'Gymnastics',
  'Full Body'
];

export const BODY_PART_OPTIONS: BodyPartEmphasis[] = [
  'Upper Body',
  'Lower Body',
  'Core',
  'Pushing',
  'Pulling',
  'Legs/Glutes',
  'Shoulders',
  'Back'
];

export const RUNNING_OPTIONS: RunningSpace[] = [
  'None (Indoor Only)',
  'Small Space (Shuttles)',
  'Open Road/Track'
];

export const STRUCTURE_OPTIONS: WorkoutStructure[] = [
  'Any',
  'For Time',
  'AMRAP',
  'EMOM (Varied)',
  'Intervals / Work-Rest',
  'Chipper'
];

export const MOCK_WORKOUTS_FALLBACK = [
  {
    id: 'mock-1',
    name: "Cindy",
    type: "AMRAP 20",
    description: "5 Pull-ups\n10 Push-ups\n15 Air Squats",
    timeEstimate: "20 min",
    equipmentNeeded: ["Pull-up Bar", "None/Bodyweight"],
    difficulty: "Intermediate",
    focus: "Gymnastics",
    tips: "Pace yourself early. Break push-ups if needed.",
    isBenchmark: true
  }
];