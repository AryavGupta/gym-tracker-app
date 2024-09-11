import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WorkoutAnalytics = ({ workoutData }) => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [strengthScore, setStrengthScore] = useState(0);

  useEffect(() => {
    if (workoutData) {
      const processedData = processWorkoutData(workoutData);
      setAnalyticsData(processedData);
      setStrengthScore(calculateStrengthScore(processedData));
    }
  }, [workoutData]);

  const processWorkoutData = (data) => {
    // Process the workout data to calculate total volume (weight * reps) for each exercise
    return data.map(workout => {
      const totalVolume = workout.exercises.reduce((acc, exercise) => {
        const exerciseVolume = exercise.sets.reduce((setAcc, set) => {
          return setAcc + (parseInt(set.weight) * parseInt(set.reps));
        }, 0);
        return acc + exerciseVolume;
      }, 0);
      return {
        date: workout.date,
        totalVolume,
      };
    });
  };

  const calculateStrengthScore = (data) => {
    // Simple strength score calculation (you can make this more sophisticated)
    if (data.length < 2) return 0;
    const latestVolume = data[data.length - 1].totalVolume;
    const firstVolume = data[0].totalVolume;
    return Math.round(((latestVolume - firstVolume) / firstVolume) * 100);
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Strength Progress Overview</h2>
        <p className="text-2xl font-bold">Strength Score: {strengthScore}%</p>
        <p className="text-sm text-gray-500">
          This score represents your overall strength improvement since you started tracking.
        </p>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Workout Volume Over Time</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalVolume" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WorkoutAnalytics;
