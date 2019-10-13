
const Router = require('express');
const admin = require('firebase-admin');
const env = require('../environment-variables');

const KEY = env.apiKey;

const router = Router();

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.name,
    }).then((record) => {
        console.log('Successfully created new user: ', record.uid);
        res.sendStatus(201);
    }).catch((err) => {
        console.log('Error creating new user: ', err);
        res.sendStatus(304)
    })
});

router.get('/:email', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    admin.auth().getUserByEmail(req.params.email).then((record) => {
        console.log('Successfully fetched user data: ', record.toJSON());
        res.send(200);
    }).catch((err) => {
        console.log('Error fetching user data: ', err);
        res.sendStatus(404);
    });
});

router.delete('/:email', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
   admin.auth().getUserByEmail(req.params.email).then((record) => {
       admin.auth().deleteUser(record.uid).then(() => {
           console.log('Successfully deleted user: ', record.uid);
           res.sendStatus(202);
       }).catch((err) => {
           console.log('Error deleting user: ', err);
           res.sendStatus(400);
       });
   }).catch((err) => {
        console.log('Error fetching user data: ', err);
        res.sendStatus(404);
   });
});

module.exports = router;
