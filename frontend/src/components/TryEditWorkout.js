import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Predefined list of exercises with muscle groups
const exerciseList = {
  chest: ['Flat Bench Press', 'Incline Press', 'Pushups', 'Decline Bench Press', 'Cable Flyes'],
  back: ['Pull-ups', 'Rows', 'Deadlifts', 'Lat Pulldowns', 'T-Bar Rows', 'Face Pulls'],
  legs: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises', 'Romanian Deadlifts', 'Leg Extensions', 'Hamstring Curls'],
  shoulders: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Shrugs', 'Reverse Flyes', 'Arnold Press'],
  arms: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Dips', 'Preacher Curls', 'Skull Crushers'],
  core: ['Crunches', 'Planks', 'Russian Twists', 'Leg Raises', 'Wood Choppers'],
  // You can add more muscle groups as needed
};

function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/workouts/${id}`);
        const { date, workoutName, exercises, weightUnit } = response.data;
        setDate(date);
        setWorkoutName(workoutName);
        setExercises(exercises);
        setWeightUnit(weightUnit);
      } catch (error) {
        console.error('Error fetching workout:', error.response ? error.response.data : error.message);
        alert('Failed to fetch workout. Please check the console for details.');
      }
    };

    fetchWorkout();
  }, [id]);

  const muscleGroups = Object.keys(exerciseList);

  const allExercises = Object.values(exerciseList).flat();

  const filteredExercises = useMemo(() => {
    let exercises = muscleFilter ? exerciseList[muscleFilter] : allExercises;
    return exercises.filter(exercise => 
      exercise.toLowerCase().includes(exerciseSearch.toLowerCase())
    );
  }, [muscleFilter, exerciseSearch, allExercises]);

  const addExercise = () => {
    if (currentExercise) {
      setExercises([...exercises, { name: currentExercise, sets: [{ reps: '', weight: '' }] }]);
      setCurrentExercise('');
    }
  };
  const handleGoBack = () => {
    navigate(-1);  // This navigates to the previous page
  };

  const addSet = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({ reps: '', weight: '' });
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const deleteSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
  };
  
  const deleteExercise = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(exerciseIndex, 1);
    setExercises(updatedExercises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const workoutData = {
      date,
      workoutName,
      exercises,
      weightUnit
    };
    console.log('Sending workout data:', JSON.stringify(workoutData, null, 2));
    try {
      const response = await axios.put(`http://localhost:5000/api/workouts/${id}`, workoutData);
      console.log('Workout updated successfully:', response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating workout:', error.response ? error.response.data : error.message);
      alert('Failed to update workout. Please check the console for details.');
    }
  };

  return (
    <div className="add-workout-container">
        <button onClick={handleGoBack} className="button">Go Back</button>
      <h2>Edit Workout</h2>
      <form onSubmit={handleSubmit} className="add-workout-form">
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="form-input"
          required
        />
        <select 
          value={workoutName} 
          onChange={(e) => setWorkoutName(e.target.value)} 
          className="form-input"
          required>
          <option value="">Select Workout Category</option>
          {muscleGroups.map((group) => (
            <option key={group} value={group}>{group.charAt(0).toUpperCase() + group.slice(1)} Day</option>
          ))}
        </select>
        
        <div className="weight-unit-selector">
          <label>Weight Unit:</label>
          <select 
            value={weightUnit} 
            onChange={(e) => setWeightUnit(e.target.value)}
            className="form-input"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="lbs">Pounds (lbs)</option>
          </select>
        </div>

        <div className="muscle-filter">
          <label>Filter by Muscle Group:</label>
          <select 
            value={muscleFilter} 
            onChange={(e) => setMuscleFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Exercises</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group}>{group.charAt(0).toUpperCase() + group.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="exercise-input">
          <div className="custom-select">
            <select 
              value={currentExercise}
              onChange={(e) => setCurrentExercise(e.target.value)}
              onKeyUp={(e) => setExerciseSearch(e.target.value)}
              className="form-input searchable-select">
              <option value="">Select Exercise</option>
              {filteredExercises
                .filter(exercise => 
                  exercise.toLowerCase().includes(exerciseSearch.toLowerCase())
                )
                .map((exercise, index) => (
                  <option key={index} value={exercise}>{exercise}</option>
                ))}
            </select>
          </div>
          <button type="button" onClick={addExercise} className="add-button">Add Exercise</button>
        </div>

        {exercises.map((exercise, exerciseIndex) => (
          <div key={exerciseIndex} className="exercise-container">
            <div className="exercise-header">
            <h3 className="exercise-name">{exercise.name}</h3>
            <button type="button" onClick={() => deleteExercise(exerciseIndex)} className="delete-button">Delete Exercise</button>
            </div>
            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex} className="set-container">
                <input 
                  type="number" 
                  placeholder="Reps" 
                  value={set.reps} 
                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)} 
                  className="form-input small-input"
                  required
                />
                <input 
                  type="number" 
                  placeholder={`Weight (${weightUnit})`} 
                  value={set.weight} 
                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)} 
                  className="form-input small-input"
                  required
                />
                <button type="button" onClick={() => deleteSet(exerciseIndex, setIndex)} className="delete-button">Delete Set</button>
              </div>
            ))}
            <button type="button" onClick={() => addSet(exerciseIndex)} className="add-button">Add Set</button>
          </div>
        ))}

        <button type="submit" className="submit-button button">Save Workout</button>
      </form>
    </div>
  );
}

export default EditWorkout;

