const firebase = require('firebase/app');
require("firebase/auth");

const authenticateUser = (email, password, res) => {
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        const uid = firebase.auth().currentUser.uid;
        console.log('Signed in: ', uid);
        res.send({ id: uid });
    }).catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        console.log('Error: ', err);
        res.send({ errorCode, errorMessage, id: undefined });
    });
};

module.exports = authenticateUser;
