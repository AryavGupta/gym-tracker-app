export const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

export const exercisesByMuscleGroup = {
  'Chest': [
    'Machine Chest Press',
    'Barbell Incline Bench Press',
    'Dumbbell Incline Bench Press',
    'Barbell Flat Bench Press',
    'Dumbbell Flat Bench Press',
    'Barbell Decline Bench Press',
    'Dumbbell Decline Bench Press',
    'Smith Machine Bench Press',
    'Dumbbell Flyes',
    'Push-Ups',
    'Dips (Chest Focus)',
    'Pec Deck/ Butterfly Machine',
    'Cable Crossovers'
  ],
  'Back': [
    'Pull-Ups',
    'Chin-Ups',
    'Barbell Bent Over Rows',
    'Dumbbell Bent Over Rows',
    'Single-Arm Dumbbell Rows',
    'Inverted Rows',
    'Lat Pulldowns',
    'Close Grip Pulldowns',
    'Back HyperExtensions',
    'Rope Straight Arm',
    'Conventional Deadlifts',
    'Reverse Flyes',
    'Seated Cable Rows',
    'T-Bar Rows'
  ],
  'Shoulders': [
    'Arnold Press',
    'Barbell Front Raises',
    'Dumbbell Front Raises',
    'Dumbbell Lateral Raises',
    'Cable Lateral Raises',
    'Dumbbell Side Raises',
    'Barbell Overhead Press',
    'Dumbbell Overhead Press',
    'Barbell Shrugs',
    'Dumbbell Shrugs',
    'Face Pulls',
    'Reverse Flyes (Rear Delts)',
    'Machine Shoulder Press',
    'Landmine Shoulder Press',
    'Pike Push-Ups',
    'Barbell Uprights'
  ],
  'Arms': [
    'Barbell Bicep Curls',
    'Cable Bicep Curls',
    'Dumbbell Bicep Curls',
    'Concentration Curls',
    'EZ-Bar Curls',
    'Dumbbell Hammer Curls',
    'Preacher Curls',
    'Reverse Curls',
    'Dips (Tricep Focus)',
    'Overhead Tricep Extensions',
    'Skull Crushers',
    'Tricep Bar Pushdowns',
    'Tricep Kickbacks',
    'Tricep Rope Pushdowns'
  ],
  'Legs': [
    'Barbell Back Squats',
    'Bulgarian Split Squats',
    'Conventional Deadlifts',
    'Front Squats',
    'Goblet Squats',
    'Hamstring Curls',
    'Hip Thrusts',
    'Leg Extensions',
    'Leg Press',
    'Romanian Deadlifts',
    'Seated Calf Raises',
    'Standing Calf Raises',
    'Stationary Lunges',
    'Sumo Deadlifts',
    'Walking Lunges',
    'Single Leg Lunges'
  ],
  'Core': [
    'Ab Wheel Rollouts',
    'Bicycle Crunches',
    'Cable Crunches',
    'Cable Woodchoppers',
    "Captain's Chair Leg Raises",
    'Decline Sit-Ups',
    'Dragon Flags',
    'Hanging Leg Raises',
    'Leg Raises',
    'Medicine Ball Slams',
    'Pallof Press',
    'Standing Ab Rollouts',
    'V-Ups',
    'Weighted Crunches',
    'Weighted Russian Twists'
  ]
};


// Mapping for analytics (optional)
export const analyticsMappings = {
    'Chest': {
      'Flat Bench Press': ['Barbell Flat Bench Press', 'Dumbbell Flat Bench Press'],
      'Incline Press': ['Barbell Incline Bench Press', 'Dumbbell Incline Bench Press'],
      'Decline Bench Press': ['Barbell Decline Bench Press', 'Dumbbell Decline Bench Press'],
      'Dumbbell Flyes': ['Dumbbell Flyes'],
      'Cable Crossovers': ['Cable Crossovers'],
      'Push-Ups': ['Push-Ups']
    },
    'Shoulders': {
      'Overhead Press': ['Barbell Overhead Press', 'Dumbbell Overhead Press', 'Machine Shoulder Press'],
      'Lateral Raises': ['Dumbbell Lateral Raises', 'Cable Lateral Raises', 'Dumbbell Side Raises'],
      'Front Raises': ['Barbell Front Raises', 'Dumbbell Front Raises'],
      'Reverse Flyes': ['Reverse Flyes (Rear Delts)'],
      'Upright Rows': ['Barbell Uprights'],
      'Arnold Press': ['Arnold Press']
    },
    // ... similarly for other muscle groups
  };