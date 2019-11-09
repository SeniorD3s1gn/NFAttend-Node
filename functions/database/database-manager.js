const admin = require('firebase-admin');
const db = admin.firestore();

retrieveCourseList = (req, res) => {
    const facultyRef = db.collection('faculty').doc(req.params.id);
    facultyRef.get().then((doc) => {
        const courses = doc.get('courses');
        if (!courses) {
            console.log('No courses available');
            res.send({ errorCode: 404, message: 'No courses found' });
            return;
        }
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
                if (details.length === course.length) {
                    res.send(err);
                }
            });
        });
    });
};

const retrieveCourse = (id) => {
    return new Promise((resolve, reject) => {
        const coursesRef = db.collection('courses').doc(id);
        coursesRef.get().then((data) => {
            resolve(data.data());
        }).catch((err) => {
            reject(err);
        });
    });
};

const retrieveStudent = (id) => {
    return new Promise((resolve, reject) => {
        const studentRef = db.collection('students').doc(id);
        studentRef.get().then((doc) => {
            if (doc.exists) {
                resolve(doc.data());
            } else {
                reject('this student does not exists.')
            }
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports = {
    retrieveCourseList,
    retrieveStudent
};
