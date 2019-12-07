const admin = require('firebase-admin');
const db = admin.firestore();

retrieveCourseList = (id, collection) => {
    return new Promise((resolve, reject) => {
        const facultyRef = db.collection(collection).doc(id);
        facultyRef.get().then((doc) => {
            const courses = doc.get('courses');
            if (!courses) {
                console.log('No courses available');
                reject({ errorCode: 404, message: 'No courses found' });
                return;
            }
            let details = [];
            courses.map((course) => {
                retrieveCourse(course).then((data) => {
                    let detail;
                    if (collection === 'faculty') {
                        detail = {
                            id: course,
                            name: data.name,
                            section: data.section,
                            number: data.number,
                        };
                    } else {
                        detail = {
                            id: course,
                            name: data.name,
                            section: data.section,
                            number: data.number,
                            professor: data.professor,
                            type: data.type,
                            times: data.times,
                            dates: data.dates,
                            location: data.location,
                        }
                    }
                    detail = JSON.parse(JSON.stringify(detail).replace(/(?:\\[rn])+/g, ''));
                    details.push(detail);
                    if (details.length === courses.length) {
                        resolve(details);
                    }
                }).catch((err) => {
                    console.log(err);
                    if (details.length === course.length) {
                        reject(err);
                    }
                });
            });
        });
    });
};

const retrieveCourse = (id) => {
    return new Promise((resolve, reject) => {
        const coursesRef = db.collection('courses').doc(id);
        coursesRef.get().then((doc) => {
            resolve(doc.data());
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

const retrieveFaculty = (id) => {
    return new Promise((resolve, reject) => {
        const facultyRef = db.collection('faculty').doc(id);
        facultyRef.get().then((doc) => {
            if (doc.exists) {
                resolve(doc.data())
            } else {
                reject('this teacher does not exists.');
            }
        }).catch((err) => {
            reject(err);
        });
    });
};

const updateCourses = (id) => {
    return new Promise((resolve, reject) => {
        const coursesCol = db.collection('courses');
        coursesCol.get().then((snapshot) => {
            snapshot.docs.forEach((course) => {
                const contains = containsStudent(id.trim(), course.data());
                if (contains) {
                    updateStudent(id, course.id).then((updated) => {
                        if (updated) {
                            console.log('updated course ' + course.id + ' for student ' + id);
                            resolve(true);
                        } else {
                            console.log('did not added course to student');
                            resolve(true);
                        }
                    }).catch((err) => {
                        console.log(err);
                        reject(err);
                    });
                }
            });
            resolve({ update: true });
        }).catch((err) => {
            reject(err);
        })
    });
};

const containsStudent = (id, course) => {
    const students = course.students;
    let studentIds = [];
    students.forEach(student => {
        if (student.key !== undefined) {
            studentIds.push(student.key);
        }
    });
    return studentIds.includes(id);
};

const updateStudent = (studentId, courseId) => {
    return new Promise((resolve, reject) => {
        const studentRef = db.collection('students').doc(studentId);
        studentRef.update({
            courses: admin.firestore.FieldValue.arrayUnion(courseId)
        }).then(() => {
            resolve(true);
        }).catch((err) => {
            reject(err);
        });
    });
};

const retrieveRecord = (recordId) => {
    return new Promise((resolve, reject) => {
        const recordRef = db.collection('records').doc(recordId);
        recordRef.get().then(doc => {
            if (!doc.exists) {
                reject({ statusCode: 404 });
            } else {
                resolve(doc.data());
            }
        }).catch(err => {
            reject(err);
        })
    });
};

const createRecord = (record) => {
    return new Promise((resolve, reject) => {
        db.collection('records').add({
            course: record.course,
            timestamp: record.timestamp,
            students: record.students
        }).then(ref => {
            resolve(ref);
        }).catch(err => {
            reject(err);
        })
    });
};

module.exports = {
    retrieveCourseList,
    retrieveStudent,
    retrieveFaculty,
    updateCourses,
    retrieveRecord,
    createRecord
};
