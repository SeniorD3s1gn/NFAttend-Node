const Router = require('express');
const admin = require('firebase-admin');
const env = require('../environment-variables');

const KEY = env.apiKey;

const db = admin.firestore();

const router = Router();

router.get('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    const id = req.params.id;
    const coursesRef = db.collection('courses').doc(id);
    coursesRef.get().then((doc) => {
        if (!doc.exists) {
            console.log(doc.data());
            res.send(doc.data());
        }
    });
});

router.get('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    const id = req.headers.id;
    if (!id) {
        console.log('request was sent without a course id');
        res.send({ error: 'Id passed is null.' });
        return;
    }
    db.collection('courses').doc(id).get().then((doc) => {
        if (doc.exists) {
            res.send(doc.data());
            console.log('sending document: ', doc.id);
        } else {
            console.log('Document doesn\'t exists');
            res.sendStatus(404);
        }
    }).catch((err) => {
        console.log('Error getting document: ', err);
        res.send(err);
    });
});

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

    const students = req.body.students.split(',');
    let formatted = [];
    students.forEach(student => {
        student = student//.replace(/[{}]/g, '')
            .replace(/[[\]]/g, '')
            .replace(/(?:\\[rn])+/g, '').trim();
        const json = JSON.parse(student);
        for (let key in json) {
            if (json.hasOwnProperty(key)) {
                let value = json[key];
                formatted.push({key, value});
            }
        }
    });

    const course = {
        name: req.body.name,
        number: req.body.number,
        section: req.body.section,
        professor: req.body.professor,
        students: formatted,
    };

    insertCourse(course).then((response) => {
        console.log('successfully added course: ', response.id);
        res.send({message: 'class successfully added'})
    }).catch((err) => {
        console.log('could not add course: ', err);
    });
});

const insertCourse = (course) => {
    return new Promise((resolve, reject) => {
        db.collection('courses').add({
            name: course.name,
            number: course.number,
            section: course.section,
            professor: course.professor,
            students: course.students,
        }).then((ref) => {
            resolve(ref);
        }).catch((err) => {
            reject(err);
        });
    });
};

const retrieveCourseData = () => {

};

module.exports = router;
