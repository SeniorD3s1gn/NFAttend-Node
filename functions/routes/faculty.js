const Router = require('express');
const env = require('../environment-variables');
const auth = require('./auth');
const {retrieveCourseList} = require("./course");

const KEY = env.apiKey;

const router = Router();

router.get('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

    const data = req.headers.data;
    switch (data) {
        case 'courses':
            retrieveCourseList(req, res);
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
    const faculty = req.body.faculty;
    if (!faculty) {
        res.send({ errorCode: 401, errorMessage: 'cannot log in as a student from this device.' });
        return;
    }
    auth(email, password, res);
});

module.exports = router;
