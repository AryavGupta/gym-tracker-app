const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true }
});

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: [SetSchema]
});

const WorkoutSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  exercises: [ExerciseSchema],
  weightUnit: { type: String, required: true, enum: ['kg', 'lbs'] }
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);
