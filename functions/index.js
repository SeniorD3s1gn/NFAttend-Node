const cors = require('cors');
const express = require('express');
const admin = require('firebase-admin');
const serviceAccountKey = require('./service-account-key');
const firebaseConfig = require('./firebase-config');
const env = require('./environment-variables');
const bodyParser = require('body-parser');
const firebase = require('firebase/app');
const functions = require('firebase-functions');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
});

firebase.initializeApp(firebaseConfig);

const routes = require('./routes');

const KEY = env.apiKey;

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
app.use('/api/courses', routes.courses);
app.use('/api/students', routes.students);
app.use('/api/faculty', routes.faculty);

// app.listen(PORT, () =>
//     console.log(`Attendance backend listening on port ${PORT}`),
// );

exports.app = functions.https.onRequest(app);
