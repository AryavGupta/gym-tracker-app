import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        setInfo('Please verify your email before logging in. Check your inbox for a verification link.');
        await sendEmailVerification(user);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.message.includes('Please verify your email')) {
        setInfo('Please verify your email before logging in. Check your inbox for a verification link.');
      } else {
        setError('Failed to log in: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    try {
      console.log('Sending request to check email:', email);
      const response = await axios.post('http://localhost:5000/api/check-email', { email });
      console.log('Response:', response.data);
      if (response.data.exists) {
        await resetPassword(email);
        setInfo('Password reset email sent. Check your inbox.');
        setError('');
      } else {
        setError('This email is not registered. Please sign up first.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process your request. Please try again.');
      setInfo('');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfo('');
    setLoading(true);
  
    try {
      const result = await loginWithGoogle();
      const user = result.user;
  
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            firstName: user.displayName ? user.displayName.split(' ')[0] : '',
            lastName: user.displayName ? user.displayName.split(' ')[1] || '' : '',
            createdAt: new Date().toISOString()
          });
        }
      } catch (firestoreError) {
        console.error('Error accessing Firestore:', firestoreError);
        console.warn('Proceeding with login despite Firestore error');
      }
  
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setInfo('Google sign-in was cancelled');
      } else {
        console.error('Google sign-in error:', error);
        setError('Failed to log in with Google. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
          {info && <Alert className="mb-4"><AlertDescription>{info}</AlertDescription></Alert>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-4"
          >
            Login with Google
          </Button>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleForgotPassword} className="text-sm">
              Forgot Password?
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;