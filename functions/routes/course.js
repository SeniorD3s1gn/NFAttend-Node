const Router = require('express');
const admin = require('firebase-admin');
const env = require('../environment-variables');

const KEY = env.apiKey;

const db = admin.firestore();

const router = Router();

router.get('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
        return;
    }
    const id = req.params.id;
    const coursesRef = db.collection('courses').doc(id);
    coursesRef.get().then((doc) => {
        if (doc.exists) {
            console.log(doc.data());
            res.send(doc.data());
        }
    }).catch((err) => {
        console.log(err);
        res.send(err);
    });
});

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }

    const students = req.body.students.split(',');
    let formatted = [];
    if (!students) {
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
    }

    const course = {
        name: req.body.name,
        number: req.body.number,
        section: req.body.section,
        type: req.body.type,
        dates: req.body.dates.split(','),
        times: req.body.times.split('-'),
        location: req.body.location,
        professor: req.body.professor,
        students: formatted,
    };

    insertCourse(course).then((response) => {
        console.log('successfully added course: ', response.id);
        res.send({ message: 'successfully added course' });
    }).catch((err) => {
        console.log('could not add course: ', err);
        res.send(err);
    });
});

const insertCourse = (course) => {
    return new Promise((resolve, reject) => {
        db.collection('courses').add({
            name: course.name,
            number: course.number,
            section: course.section,
            type: course.type,
            dates: course.dates,
            times: course.times,
            location: course.location,
            professor: course.professor,
            students: course.students,
        }).then((ref) => {
            updateFaculty(course.professor.trim(), ref.id).then(() => {
                resolve(ref);
            }).catch((err) => {
                reject(err);
            })
        }).catch((err) => {
            reject(err);
        });
    });
};

const updateFaculty = (faculty, course) => {
    return new Promise((resolve, reject) => {
        const facultyRef = db.collection('faculty').doc(faculty);
        facultyRef.update({
            courses: admin.firestore.FieldValue.arrayUnion(course)
        }).then(() => {
            console.log('added course to professor document');
            resolve();
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
};

module.exports = router;
