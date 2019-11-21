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
    retrieveCourse(id).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    });
});

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }

    let formatted = [];
    if (req.body.students) {
        const students = req.body.students.split(',');
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

router.delete('/:id', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }

    const id = req.params.id;
    retrieveCourse(id).then((data) => {
        const professor_id = data.professor;
        const students = data.students;
        const student_ids = [];
        students.forEach(student => {
            student_ids.push(student['key']);
        });

        removeCourseFromFaculty(professor_id, id).then((resolve) => {
            console.log(resolve);
            console.log('removed course for faculty');
        }).catch((err) => {
            console.log(err);
        });
        student_ids.forEach((s_id) => {
            removeCourseFromStudent(s_id, id).then((_resolve) => {
                console.log('removed course for student')
            }).catch((err) => {
                console.log(err);
            })
        });

        deleteCourse(id).then((resolve) => {
            res.send(resolve)
        }).catch((err) => {
            res.send(err);
        });
    }).catch((err) => {
        res.send(err);
    });

});

const retrieveCourse = (id) => {
    return new Promise((resolve, reject) => {
        const coursesRef = db.collection('courses').doc(id);
        coursesRef.get().then((doc) => {
            if (doc.exists) {
                console.log(doc.data());
                resolve(doc.data());
            } else {
                reject({ message: 'course not found' });
            }
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
};

const deleteCourse = (id) => {
    return new Promise((resolve, reject) => {
        db.collection('courses').doc(id).delete().then(() => {
            resolve({ message: 'course deleted' });
        }).catch((err) => {
            reject(err);
        });
    });
};

const removeCourseFromStudent = (id, course_id) => {
    return new Promise((resolve, reject) => {
        const studentRef = db.collection('students').doc(id);
        studentRef.update({
            courses: admin.firestore.FieldValue.arrayRemove(course_id)
        }).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });
};

const removeCourseFromFaculty = (id, course_id) => {
    return new Promise((resolve, reject) => {
        const facultyRef = db.collection('faculty').doc(id);
        facultyRef.update({
            courses: admin.firestore.FieldValue.arrayRemove(course_id)
        }).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });
};

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
                // resolve(ref);
            }).catch((err) => {
                console.log(err);
            });
            resolve(ref);
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
