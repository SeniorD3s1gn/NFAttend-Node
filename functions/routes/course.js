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

module.exports = {
    router,
    retrieveCourseList,
};
