import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ArrowLeft } from 'lucide-react';

function ViewWorkout() {
  const { workoutId } = useParams();
  const [workout, setWorkout] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const workoutDoc = await getDoc(doc(db, 'workouts', workoutId));
        if (workoutDoc.exists()) {
          setWorkout({ id: workoutDoc.id, ...workoutDoc.data() });
        } else {
          console.error('Workout not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching workout:', error);
      }
    };

    fetchWorkout();
  }, [workoutId, navigate]);

  if (!workout) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-6 bg-gray-100">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
            {currentUser.displayName ? `${currentUser.displayName}'s Workout` : 'Your Workout'}
          </CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)} className="h-10 bg-gray-200 text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </CardHeader>
        <CardContent className="bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="font-semibold">Date:</p>
              <p>{new Date(workout.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold">Workout Name:</p>
              <p>{workout.workoutName}</p>
            </div>
            <div>
              <p className="font-semibold">Weight Unit:</p>
              <p>{workout.weightUnit}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Exercises:</h3>
          {workout.exercises.map((exercise, index) => (
            <Card key={index} className="mb-6">
              <CardHeader>
                <CardTitle>{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><b>SET</b></TableHead>
                      <TableHead><b>REPS</b></TableHead>
                      <TableHead><b>WEIGHT</b></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercise.sets.map((set, setIndex) => (
                      <TableRow key={setIndex}>
                        <TableCell>{setIndex + 1}</TableCell>
                        <TableCell>{set.reps}</TableCell>
                        <TableCell>{set.weight} {workout.weightUnit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ViewWorkout;