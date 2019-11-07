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
        const uid = firebase.auth().currentUser.uid;
        res.send({id: uid});
    }).catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        console.log('Error: ', err);
        res.send({ errorCode, errorMessage, id: undefined });
    });
});

const retrieveFaculty = () => {

};

module.exports = router;
