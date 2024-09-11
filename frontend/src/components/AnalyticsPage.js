import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { muscleGroups, exercisesByMuscleGroup } from './exercises';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { ArrowLeft } from 'lucide-react';

const muscleGroupExercises = exercisesByMuscleGroup

// You might want to fetch this from user preferences or have a default
const userGoals = {
  volumeImportance: 0.2,
  frequencyImportance: 0.2,
  balanceImportance: 0.2,
  progressiveOverloadImportance: 0.2,
  personalRecordImportance: 0.2
};

function AnalyticsPage() {
  const [workoutData, setWorkoutData] = useState([]);
  const [overallPerformanceScore, setOverallPerformanceScore] = useState(0);
  const [timePeriod, setTimePeriod] = useState('lastMonth');
  const [customMonth, setCustomMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchWorkoutData();
  }, [currentUser]);

  const fetchWorkoutData = useCallback(async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const q = query(collection(db, 'workouts'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkoutData(data);
    } catch (error) {
      console.error('Error fetching workout data:', error);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchWorkoutData();
  }, [fetchWorkoutData]);

  

  const calculateEnhancedPerformanceScore = useCallback((data, timePeriod, userGoals) => {
    const currentDate = new Date();
    const periodStart = getPeriodStart(currentDate, timePeriod);
    const previousPeriodStart = getPeriodStart(periodStart, timePeriod);
  
    const currentPeriodWorkouts = data.filter(workout => new Date(workout.date) >= periodStart);
    const previousPeriodWorkouts = data.filter(workout => new Date(workout.date) >= previousPeriodStart && new Date(workout.date) < periodStart);
  
    // Calculate sub-scores
    const volumeScore = calculateVolumeScore(currentPeriodWorkouts, previousPeriodWorkouts);
    const frequencyScore = calculateFrequencyScore(currentPeriodWorkouts, timePeriod);
    const balanceScore = calculateBalanceScore(currentPeriodWorkouts);
    const progressiveOverloadScore = calculateProgressiveOverloadScore(currentPeriodWorkouts);
    const personalRecordScore = calculatePersonalRecordScore(currentPeriodWorkouts, previousPeriodWorkouts);
  
    // Weight the scores based on user goals
    const weightedScore = (
      volumeScore * userGoals.volumeImportance +
      frequencyScore * userGoals.frequencyImportance +
      balanceScore * userGoals.balanceImportance +
      progressiveOverloadScore * userGoals.progressiveOverloadImportance +
      personalRecordScore * userGoals.personalRecordImportance
    ) / (
      userGoals.volumeImportance +
      userGoals.frequencyImportance +
      userGoals.balanceImportance +
      userGoals.progressiveOverloadImportance +
      userGoals.personalRecordImportance
    );
  
    return Math.round(weightedScore);
  }, []);

  useEffect(() => {
    if (workoutData.length > 0) {
      const score = calculateEnhancedPerformanceScore(workoutData, timePeriod, userGoals);
      setOverallPerformanceScore(score);
    }
  }, [workoutData, timePeriod, calculateEnhancedPerformanceScore]);

  const calculateVolumeScore = (currentWorkouts, previousWorkouts) => {
    const currentVolume = calculateTotalVolume(currentWorkouts);
    const previousVolume = calculateTotalVolume(previousWorkouts);
    return previousVolume > 0 ? (currentVolume / previousVolume) * 100 : 100;
  };
  
  const calculateFrequencyScore = (workouts, timePeriod) => {
    const workoutCount = workouts.length;
    const expectedWorkouts = timePeriod === 'week' ? 3 : timePeriod === 'month' ? 12 : 144; // Adjust as needed
    return Math.min((workoutCount / expectedWorkouts) * 100, 100);
  };
  
  const calculateBalanceScore = (workouts) => {
    const muscleGroupVolumes = muscleGroups.map(group => 
      calculateMuscleGroupVolume(workouts, group)
    );
    const totalVolume = muscleGroupVolumes.reduce((sum, volume) => sum + volume, 0);
    const idealBalance = totalVolume / muscleGroups.length;
    
    const balanceDeviation = muscleGroupVolumes.reduce((sum, volume) => 
      sum + Math.abs(volume - idealBalance), 0
    ) / totalVolume;
  
    return (1 - balanceDeviation) * 100;
  };
  
  const calculateProgressiveOverloadScore = (workouts) => {
    // Implement logic to check if weights or reps are increasing over time
    // This is a simplified version
    let progressiveOverloadCount = 0;
    for (let i = 1; i < workouts.length; i++) {
      if (calculateTotalVolume([workouts[i]]) > calculateTotalVolume([workouts[i-1]])) {
        progressiveOverloadCount++;
      }
    }
    return (progressiveOverloadCount / (workouts.length - 1)) * 100;
  };
  
  const calculatePersonalRecordScore = (currentWorkouts, previousWorkouts) => {
    // Implement logic to check for personal records in key exercises
    // This is a simplified version
    const currentMaxes = findMaxLifts(currentWorkouts);
    const previousMaxes = findMaxLifts(previousWorkouts);
    
    let prCount = 0;
    Object.keys(currentMaxes).forEach(exercise => {
      if (currentMaxes[exercise] > (previousMaxes[exercise] || 0)) {
        prCount++;
      }
    });
  
    return (prCount / Object.keys(currentMaxes).length) * 100;
  };
  
  const findMaxLifts = (workouts) => {
    const maxLifts = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const maxWeight = Math.max(...exercise.sets.map(set => parseFloat(set.weight)));
        if (!maxLifts[exercise.name] || maxWeight > maxLifts[exercise.name]) {
          maxLifts[exercise.name] = maxWeight;
        }
      });
    });
    return maxLifts;
  };

  const getPeriodStart = (date, period) => {
    const newDate = new Date(date);
    switch (period) {
      case 'lastWeek':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'lastMonth':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'lastYear':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
      case 'customMonth':
        const [year, month] = customMonth.split('-');
        newDate.setFullYear(parseInt(year), parseInt(month) - 1, 1);
        break;
      default:
        console.error('Invalid time period:', period);
        return date;
    }
    return newDate;
  };

  const getPeriodEnd = (date, period) => {
    const newDate = new Date(date);
    if (period === 'customMonth') {
      const [year, month] = customMonth.split('-');
      newDate.setFullYear(parseInt(year), parseInt(month), 0); // Last day of the selected month
    }
    return newDate;
  };

  const calculateTotalVolume = (workouts) => {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
          return setTotal + (parseInt(set.reps) * parseFloat(set.weight));
        }, 0);
      }, 0);
    }, 0);
  };

  const calculateMuscleGroupVolume = (workouts, muscleGroup) => {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises
        .filter(exercise => muscleGroupExercises[muscleGroup].includes(exercise.name))
        .reduce((exerciseTotal, exercise) => {
          return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
            return setTotal + (parseInt(set.reps) * parseFloat(set.weight));
          }, 0);
        }, 0);
    }, 0);
  };

  const processWorkoutData = (data, muscleGroup) => {
    const currentDate = new Date();
    const periodStart = getPeriodStart(currentDate, timePeriod);
    const periodEnd = getPeriodEnd(currentDate, timePeriod);
    const filteredData = data.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= periodStart && workoutDate <= periodEnd;
    });

    const processedData = filteredData.reduce((acc, workout) => {
      const date = workout.date;
      const volume = workout.exercises
        .filter(exercise => muscleGroupExercises[muscleGroup].includes(exercise.name))
        .reduce((exerciseTotal, exercise) => {
          return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
            return setTotal + (parseInt(set.reps) * parseFloat(set.weight));
          }, 0);
        }, 0);
      
      if (volume > 0) {
        const existingEntry = acc.find(entry => entry.date === date);
        if (existingEntry) {
          existingEntry[`${muscleGroup} Score`] = (existingEntry[`${muscleGroup} Score`] || 0) + volume;
      } else {
        acc.push({ date, [`${muscleGroup} Score`]: volume });
      }
      }
      return acc;
    }, []);

    return processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const handleCustomMonthChange = (e) => {
    setCustomMonth(e.target.value);
    setTimePeriod('customMonth');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-6 bg-gray-100">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
            {currentUser?.displayName ? `${currentUser.displayName}'s Workout Analytics` : 'Workout Analytics'}
          </CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)} className="h-10 bg-gray-200 text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </CardHeader>
        <CardContent className="bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white shadow">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Overall Performance</h2>
                <div className="flex items-center justify-center">
                  <div className="text-6xl font-bold text-blue-600">{overallPerformanceScore}%</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Time Period</h2>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className="w-full mb-4">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastWeek">Last Week</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="lastYear">Last Year</SelectItem>
                    <SelectItem value="customMonth">Custom Month</SelectItem>
                  </SelectContent>
                </Select>
                {timePeriod === 'customMonth' && (
                  <Input
                    type="month"
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                    max={new Date().toISOString().slice(0, 7)}
                    className="w-full"
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full mb-4">
            <Tabs defaultValue={muscleGroups[0]} className="w-full">
              <div className="overflow-x-auto mb-4">
                <TabsList className="inline-flex w-max border-b border-gray-200">
                  {muscleGroups.map((group) => (
                    <TabsTrigger
                      key={group}
                      value={group}
                      className="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-blue-500"
                    >
                      {group}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {muscleGroups.map((group) => (
                <TabsContent key={group} value={group}>
                  <Card className="bg-white shadow">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-700">{group} Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={processWorkoutData(workoutData, group)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip contentStyle={{ background: 'white', border: '1px solid #ccc' }} />
                          <Legend />
                          <Line type="monotone" dataKey={`${group} Score`} stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsPage;