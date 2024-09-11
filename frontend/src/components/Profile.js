import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Edit, Save, LogOut, Lock } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(currentUser.displayName || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ displayName: userName });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setError('Password updated successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password. Please check your old password and try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-6 bg-gray-100">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">User Profile</CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)} className="h-10 bg-gray-200 text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </CardHeader>
        <CardContent className="bg-gray-50 p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentUser.photoURL || 'https://github.com/shadcn.png'} alt="Profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button onClick={handleUpdateProfile} size="sm">
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg font-medium">{currentUser.displayName || 'Not set'}</p>
                )}
                <p className="text-gray-600">{currentUser.email}</p>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              <Edit className="h-4 w-4 mr-2" /> {isEditing ? 'Cancel' : 'Edit Name'}
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Old Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">
                <Lock className="h-4 w-4 mr-2" /> Change Password
              </Button>
            </form>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;