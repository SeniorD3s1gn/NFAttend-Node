const cors = require('cors');
const express = require('express');
const admin = require('firebase-admin');
const serviceAccountKey = require('./service-account-key');
const firebaseConfig = require('./firebase-config');
const env = require('./environment-variables');
const bodyParser = require('body-parser');
const firebase = require('firebase/app');

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
        res.sendStatus(401);
        return;
    }
    res.sendStatus(200);
});

app.use('/api/auth', routes.auth);
app.use('/api/users', routes.users);
app.use('/api/courses', routes.courses);
app.use('/api/students', routes.students);
app.use('/api/faculty', routes.faculty);
app.use('/api/attend', routes.attend);
app.use('/api/records', routes.records);

app.listen(3000, () =>
    console.log(`Attendance backend listening on port ${3000}`),
);
