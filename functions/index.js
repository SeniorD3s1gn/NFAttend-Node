const cors = require('cors');
const express = require('express');
const admin = require('firebase-admin');
const routes = require('./routes');
const serviceAccountKey = require('./service-account-key');
const env = require('./environment-variables');
const bodyParser = require('body-parser');
const firebase = require('firebase/app');
const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const KEY = env.apiKey;
const FIREBASE_KEY = env.firebaseApiKey;
const APP_ID = env.appId;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: 'https://attendanceov.firebaseio.com'
});

const firebaseConfig = {
    apiKey: FIREBASE_KEY,
    authDomain: "nfattend.firebaseapp.com",
    databaseURL: "https://nfattend.firebaseio.com",
    projectId: "nfattend",
    storageBucket: "nfattend.appspot.com",
    messagingSenderId: "550278693891",
    appId: APP_ID,
    measurementId: "G-JM5X97JKT8"
};

firebase.initializeApp(firebaseConfig);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors());

app.get('/api', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    res.sendStatus(200);
});

app.use('/api/users', routes.users);
app.use('/api/auth', routes.auth);

// app.listen(PORT, () =>
//     console.log(`Attendance backend listening on port ${PORT}`),
// );

exports.app = functions.https.onRequest(app);
