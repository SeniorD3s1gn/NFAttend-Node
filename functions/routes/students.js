const Router = require('express');
const env = require('../environment-variables');
const dataManager = require('../database/database-manager');

const KEY = env.apiKey;

const router = Router();

router.get('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }

    const data = req.headers.data;
    switch (data) {
        case 'courses':
            dataManager.updateCourses(req.params.id).then((resolve) => {
                if (resolve) {
                    dataManager.retrieveCourseList(req.params.id).then((resolve) => {
                        console.log('sending courses');
                        res.send(resolve);
                    }).catch((err) => {
                        console.log('err: ', err);
                        res.send(err);
                    });
                }
            }).catch((reject) => {
                console.log('err: ', reject);
               res.send(reject);
            });
            break;
        case 'students':
            break;
        default:
            dataManager.retrieveStudent(req.params.id).then((student) => {
                console.log('sending student: ', student);
                res.send({ ...student, id: req.params.id });
            }).catch((err) => {
                console.log('error sending student: ', err);
                res.send(err);
            });
            break;
    }
});

module.exports = router;
