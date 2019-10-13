const Router = require('express');
const firebase = require('firebase/app');
require("firebase/auth");
const env = require('../environment-variables');

const KEY = env.apiKey;

const router = Router();

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    const email = req.body.email;
    const password = req.body.password;
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        console.log('Signed in');
        res.sendStatus(200);
    }).catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        if (errorCode === 'auth/wrong-password') {
            console.log('Wrong password.');
            res.sendStatus(401);
        } else {
            console.log(errorMessage);
            res.sendStatus(401);
        }
        console.log(error);
        res.sendStatus(401);
    })
});

module.exports = router;
