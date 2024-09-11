import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { muscleGroups, exercisesByMuscleGroup } from './exercises';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { PlusCircle, ArrowLeft, Trash2, Plus } from 'lucide-react';

function AddWorkout() {
  const [date, setDate] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [exercises, setExercises] = useState([]);
  const [weightUnit, setWeightUnit] = useState('kg');
  const navigate = useNavigate();
  const { getIdToken } = useAuth();
  const auth = getAuth();

  const handleAddExercise = (exerciseName) => {
    setExercises([...exercises, { name: exerciseName, sets: [{ reps: '', weight: '' }] }]);
    // Scroll to the newly added exercise
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleDeleteExercise = (index) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
  };

  const handleAddSet = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({ reps: '', weight: '' });
    setExercises(updatedExercises);
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updatedExercises);
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      console.error('No user logged in');
      navigate('/login');
      return;
    }

    try {
      const idToken = await getIdToken();
      const workoutData = {
        date,
        workoutName,
        exercises,
        weightUnit,
        userId: auth.currentUser.uid,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'workouts'), workoutData);
      console.log('Workout added with ID: ', docRef.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding workout: ', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 gap-4 bg-gray-100">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Add New Workout</CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)} className="h-10 bg-gray-200 text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </CardHeader>
        <CardContent className="bg-gray-50 p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (keep existing date, workout name, weight unit, and muscle group inputs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workoutName">Workout Name</Label>
                <Input
                  type="text"
                  id="workoutName"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  required
                  placeholder="Enter workout name"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weightUnit">Weight Unit</Label>
                <select
                  id="weightUnit"
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="muscleGroup">Muscle Group</Label>
                <select
                  id="muscleGroup"
                  value={selectedMuscleGroup}
                  onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Exercises</option>
                  {muscleGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>
            {exercises.length > 0 && (
              <ScrollArea className="h-[40vh] w-full border rounded-md p-4 bg-white">
                {exercises.map((exercise, exerciseIndex) => (
                  <Card key={exerciseIndex} className="mb-4 border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">{exercise.name}</h3>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDeleteExercise(exerciseIndex)}
                          // className="bg-red-450 hover:bg-red-600 text-white"
                          className="border-red-500  hover:bg-red-600 text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-2 mb-2">
                          <Input
                            type="number"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                            required
                            className="w-1/4"
                          />
                          <Input
                            type="number"
                            placeholder="Weight"
                            value={set.weight}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                            required
                            className="w-1/4"
                          />
                          <span className="text-sm text-gray-500">{weightUnit}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                            className="ml-2 border-red-500 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddSet(exerciseIndex)} 
                        className="mt-2 text-primary hover:bg-primary/10"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Set
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            )}

            <div className="space-y-2">
              <Label htmlFor="exerciseList">Add Exercise</Label>
              <select
                id="exerciseList"
                onChange={(e) => handleAddExercise(e.target.value)}
                value=""
                className="w-full p-2 border rounded"
              >
                <option value="">Select an exercise</option>
                {Object.entries(exercisesByMuscleGroup)
                  .filter(([group]) => !selectedMuscleGroup || group === selectedMuscleGroup)
                  .flatMap(([_, groupExercises]) => groupExercises)
                  .map((exercise) => (
                    <option key={exercise} value={exercise}>{exercise}</option>
                  ))}
              </select>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Save Workout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddWorkout;