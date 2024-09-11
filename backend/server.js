const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { admin, db } = require('./firebaseConfig');

const app = express();

app.use(cors());
app.use(express.json());

// Pass both admin and db to workoutRoutes if needed
const workoutRoutes = require('./routes/workouts')(admin, db);
app.use('/api', workoutRoutes);

// Add this error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
