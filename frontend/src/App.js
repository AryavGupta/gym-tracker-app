import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AddWorkout from './components/AddWorkout';
import EditWorkout from './components/EditWorkout';
import PrivateRoute from './components/PrivateRoute';
import ViewWorkout from './components/ViewWorkout';
import AnalyticsPage from './components/AnalyticsPage';
import Profile from './components/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/add-workout" element={<PrivateRoute><AddWorkout /></PrivateRoute>} />
          <Route path="/edit-workout/:workoutId" element={<EditWorkout />} />
          <Route path="/view-workout/:workoutId" element={<ViewWorkout />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;