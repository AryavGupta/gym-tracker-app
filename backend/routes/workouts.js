const express = require('express');
const router = express.Router();

// Middleware for verifying Firebase ID token
const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = (admin, db) => {
  // Get all workouts for the authenticated user
  router.get('/', verifyToken, async (req, res) => {
    try {
      const workoutsSnapshot = await db.collection('workouts')
        .where('userId', '==', req.user.uid)
        .orderBy('date', 'desc')
        .get();
      const workouts = [];
      workoutsSnapshot.forEach(doc => {
        workouts.push({ id: doc.id, ...doc.data() });
      });
      res.json(workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get a single workout
  router.get('/:id', verifyToken, async (req, res) => {
    try {
      const workoutDoc = await db.collection('workouts').doc(req.params.id).get();
      if (!workoutDoc.exists) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      const workoutData = workoutDoc.data();
      if (workoutData.userId !== req.user.uid) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      res.json({ id: workoutDoc.id, ...workoutData });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add a new workout
  router.post('/', verifyToken, async (req, res) => {
    console.log('Received add workout:', req.params.id);
    
    try {
      const workoutData = {
        ...req.body,
        userId: req.user.uid
      };
      const newWorkout = await db.collection('workouts').add(workoutData);
      res.status(201).json({ id: newWorkout.id, ...workoutData });
    } catch (error) {
      console.error('Error adding workout:', error);
      res.status(400).json({ message: 'Error adding workout', error: error.message });
    }
  });
  
  // Update a workout
  router.put('/:id', verifyToken, async (req, res) => {
    console.log('Received edit workout:', req.params.id);
    try {
      const workoutDoc = await db.collection('workouts').doc(req.params.id).get();
      if (!workoutDoc.exists) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      if (workoutDoc.data().userId !== req.user.uid) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      const updatedData = { ...req.body, userId: req.user.uid };
      await db.collection('workouts').doc(req.params.id).update(updatedData);
      res.json({ id: req.params.id, ...updatedData });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete a workout
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const workoutDoc = await db.collection('workouts').doc(req.params.id).get();
      if (!workoutDoc.exists) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      if (workoutDoc.data().userId !== req.user.uid) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      await db.collection('workouts').doc(req.params.id).delete();
      res.json({ message: 'Workout deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.post('/check-email', async (req, res) => {
    const { email } = req.body;
    try {
      // console.log('Checking email:', email);
      const userRecord = await admin.auth().getUserByEmail(email);
      // console.log('User found:', userRecord.uid);
      res.json({ exists: true });
    } catch (error) {
      console.error('Error checking email:', error);
      if (error.code === 'auth/user-not-found') {
        res.json({ exists: false });
      } else {
        res.status(500).json({ 
          message: 'Server error', 
          error: error.message, 
          stack: error.stack,
          code: error.code
        });
      }
    }
  });

  return router;
};
