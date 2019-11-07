const Router = require('express');
const admin = require('firebase-admin');
const env = require('../environment-variables');

const KEY = env.apiKey;

const router = Router();

const db = admin.firestore();

router.get('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

    const data = req.headers.data;
    switch (data) {
        case 'courses':
            retrieveCourseList(req, res);
            break;
        default:
            break;
    }
});

const retrieveCourseList = (req, res) => {
    const facultyRef = db.collection('faculty').doc(req.params.id);
    facultyRef.get().then((doc) => {
        const courses = doc.get('courses');
        let details = [];
        courses.forEach((course) => {
            retrieveCourse(course).then((data) => {
                console.log(data);
                const detail = {
                    id: course,
                    name: data.name,
                    section: data.section,
                    number: data.number,
                };
                details.push(detail);
                if (details.length === courses.length) {
                    res.send(details);
                }
            }).catch((err) => {
                console.log(err);
                res.send(err);
            });
        });
    });
};

const retrieveCourse = (id) => {
    return new Promise((resolve, reject) => {
        db.collection('courses').doc(id).get().then((doc) => {
            resolve(doc.data());
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports = router;
