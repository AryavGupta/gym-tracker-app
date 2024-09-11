import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ScrollArea } from "../components/ui/scroll-area";
import { PlusCircle, BarChart2, LogOut, User, Edit, Eye, Trash2, SortAsc, SortDesc } from 'lucide-react';


function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [viewBy, setViewBy] = useState(() => {
    return localStorage.getItem('dashboardViewBy') || 'date';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem('dashboardSortOrder') || 'asc';
  });
  const { logout, currentUser, getIdToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkouts();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dashboardViewBy', viewBy);
  }, [viewBy]);

  useEffect(() => {
    localStorage.setItem('dashboardSortOrder', sortOrder);
  }, [sortOrder]);

  const fetchWorkouts = async () => {
    if (!currentUser) return;

    try {
      const q = query(collection(db, 'workouts'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const workoutList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkouts(workoutList);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        // Delete the document from Firestore
        await deleteDoc(doc(db, 'workouts', id));
        
        // Update the local state
        setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout.id !== id));
        
        console.log('Workout deleted successfully');
      } catch (error) {
        console.error('Error deleting workout:', error);
      }
    }
  };

  const toggleViewBy = () => {
    setViewBy(prev => prev === 'date' ? 'muscle' : 'date');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedWorkouts = [...workouts].sort((a, b) => {
    if (viewBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    } else {
      return sortOrder === 'asc'
        ? a.workoutName.localeCompare(b.workoutName)
        : b.workoutName.localeCompare(a.workoutName);
    }
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Card className="bg-white shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-4 bg-gray-100">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Your Workouts</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 bg-gray-200 text-gray-800">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>{currentUser.displayName || currentUser.email}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button asChild className="w-full bg-black hover:bg-gray-800 text-white">
              <Link to="/add-workout">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Workout
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800">
              <Link to="/analytics">
                <BarChart2 className="mr-2 h-4 w-4" /> Analytics
              </Link>
            </Button>
          </div>
          <div className="flex justify-between mb-4">
            <Button 
              onClick={toggleViewBy} 
              variant="outline" 
              className="text-xs sm:text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm"
            >
              {viewBy === 'date' ? 'Sort by Date' : 'Sort by Name'}
            </Button>
            <Button 
              onClick={toggleSortOrder} 
              variant="outline" 
              className="px-2 sm:px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-1" /> : <SortDesc className="h-4 w-4 mr-1" />}
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
          </div>
          <ScrollArea className="h-[60vh] w-full border border-gray-200 rounded-md">
            <div className="min-w-full">
              {sortedWorkouts.map((workout) => (
                <div key={workout.id} className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">{new Date(workout.date).toLocaleDateString()}</p>
                    <h3 className="font-semibold text-gray-800">{workout.workoutName}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <Button asChild size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200">
                      <Link to={`/edit-workout/${workout.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200">
                      <Link to={`/view-workout/${workout.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(workout.id)} 
                      className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
  
}

export default Dashboard;