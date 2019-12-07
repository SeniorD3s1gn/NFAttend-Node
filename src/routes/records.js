const Router = require('express');
const env = require('../environment-variables');
const dataManager = require("../database/database-manager");

const KEY = env.apiKey;

const router = Router();

router.get('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

    let id = req.params.id;
    dataManager.retrieveRecord(id).then((data) => {
        res.send(data);
    }).catch(err => {
        res.send(err);
    });
});

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

    let formatted = [];
    if (req.body.students) {
        const students = JSON.parse(req.body.students);
        console.log(students);
    }

    console.log(req.body.timestamp);

    let record = {
        course: req.body.course,
        timestamp: req.body.timestamp,
        students: formatted
    };

    res.sendStatus(200);

    // dataManager.createRecord(record).then((resolve) => {
    //     res.send({ statusCode: 202, id: resolve });
    // }).catch(err => {
    //     res.send(err);
    // });
});

module.exports = router;
