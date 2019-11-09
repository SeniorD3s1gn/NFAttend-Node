const Router = require('express');
const env = require('../environment-variables');
const auth = require('./auth');
const dataManager = require("../database/database-manager");

const KEY = env.apiKey;

const router = Router();

router.get('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

    const data = req.headers.data;
    switch (data) {
        case 'courses':
            dataManager.retrieveCourseList(req, res);
            break;
        case 'students':
            break;
        default:
            break;
    }
});

router.post('/auth', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    const email = req.body.email;
    const password = req.body.password;
    auth(email, password, res);
});

module.exports = router;
