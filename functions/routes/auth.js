const Router = require('express');
const firebase = require('firebase/app');
require("firebase/auth");
const env = require('../environment-variables');

const router = Router();

const KEY = env.apiKey;

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }
    const email = req.body.email;
    const password = req.body.password;
    authenticateUser(email, password).then((uid) => {
        console.log('Signed in: ', uid);
        res.send({ id: uid });
    }).catch((err) => {
        console.log('Error: ', err);
        res.send(err);
    });
});

const authenticateUser = (email, password) => {
    return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            const uid = firebase.auth().currentUser.uid;
            resolve(uid);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports = router;
