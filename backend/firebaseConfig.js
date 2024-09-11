const admin = require('firebase-admin');
const serviceAccount = require('./gym-progress-d1b0c-firebase-adminsdk-32c6j-17ef0124c4.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "gym-progress-d1b0c"
});

const db = admin.firestore();

module.exports = { admin, db };


