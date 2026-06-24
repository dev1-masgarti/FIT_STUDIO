export type ExerciseCategory =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body';

export type CatalogExercise = {
  name: string;
  muscles: string;
  category: ExerciseCategory;
};

export const exerciseCategories: ExerciseCategory[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
];

export const exerciseCatalog: CatalogExercise[] = [
  { name: 'Bench Press', muscles: 'Chest · Triceps · Shoulders', category: 'Chest' },
  { name: 'Incline Dumbbell Press', muscles: 'Upper Chest · Shoulders', category: 'Chest' },
  { name: 'Chest Fly', muscles: 'Chest', category: 'Chest' },
  { name: 'Push-ups', muscles: 'Chest · Triceps · Core', category: 'Chest' },
  { name: 'Cable Crossover', muscles: 'Chest', category: 'Chest' },

  { name: 'Deadlift', muscles: 'Back · Glutes · Hamstrings', category: 'Back' },
  { name: 'Pull-ups', muscles: 'Back · Biceps', category: 'Back' },
  { name: 'Bent-over Row', muscles: 'Back · Biceps', category: 'Back' },
  { name: 'Lat Pulldown', muscles: 'Lats · Biceps', category: 'Back' },
  { name: 'Seated Cable Row', muscles: 'Back · Rear Delts', category: 'Back' },

  { name: 'Back Squat', muscles: 'Quads · Hamstrings · Core', category: 'Legs' },
  { name: 'Front Squat', muscles: 'Quads · Core', category: 'Legs' },
  { name: 'Leg Press', muscles: 'Quads · Glutes', category: 'Legs' },
  { name: 'Romanian Deadlift', muscles: 'Hamstrings · Glutes', category: 'Legs' },
  { name: 'Walking Lunges', muscles: 'Quads · Glutes', category: 'Legs' },
  { name: 'Leg Curl', muscles: 'Hamstrings', category: 'Legs' },

  { name: 'Shoulder Press', muscles: 'Shoulders · Triceps', category: 'Shoulders' },
  { name: 'Lateral Raise', muscles: 'Side Delts', category: 'Shoulders' },
  { name: 'Front Raise', muscles: 'Front Delts', category: 'Shoulders' },
  { name: 'Rear Delt Fly', muscles: 'Rear Delts', category: 'Shoulders' },

  { name: 'Barbell Curl', muscles: 'Biceps', category: 'Arms' },
  { name: 'Hammer Curl', muscles: 'Biceps · Forearms', category: 'Arms' },
  { name: 'Triceps Pushdown', muscles: 'Triceps', category: 'Arms' },
  { name: 'Skull Crushers', muscles: 'Triceps', category: 'Arms' },

  { name: 'Plank', muscles: 'Core', category: 'Core' },
  { name: 'Hanging Leg Raise', muscles: 'Core · Hip Flexors', category: 'Core' },
  { name: 'Cable Crunch', muscles: 'Abs', category: 'Core' },
  { name: 'Russian Twist', muscles: 'Obliques', category: 'Core' },

  { name: 'Clean & Press', muscles: 'Full Body', category: 'Full Body' },
  { name: 'Kettlebell Swing', muscles: 'Posterior Chain', category: 'Full Body' },
  { name: 'Thruster', muscles: 'Full Body', category: 'Full Body' },
  { name: 'Burpees', muscles: 'Full Body · Conditioning', category: 'Full Body' },
];
