const Router = require('express');
const admin = require('firebase-admin');
const env = require('../environment-variables');

const KEY = env.apiKey;

const db = admin.firestore();

const router = Router();

router.get('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    db.listCollections().then((collection) => {
        console.log('Collection: ', collection);
    });
    db.collection('courses').doc('KgU92GBCmvn7EQUFVHpI').get().then((doc) => {
        if (!doc.exists) {
            console.log('Document data: ', doc.data())
        } else {
            console.log('Document doesn\'t exists');
        }
        res.sendStatus(200);
    }).catch((err) => {
        console.log('Error getting document: ', err);
        res.send(err);
    });

});

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

});

module.exports = router;
