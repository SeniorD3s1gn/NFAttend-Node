const admin = require('firebase-admin');
const db = admin.firestore();

retrieveCourseList = (id) => {
    return new Promise((resolve, reject) => {
        const facultyRef = db.collection('faculty').doc(id);
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
                    console.log(data);
                    const detail = {
                        id: course,
                        name: data.name,
                        section: data.section,
                        number: data.number,
                    };
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
                if (containsStudent(id, course)) {
                    if (updateStudent(id, course.id)) {
                        console.log('added course ' + course.id + ' to student ' + id);
                    }
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
    students.forEach(student => {
        for (let key in student) {
            if (student.hasOwnProperty(key)) {
                if (key === id) {
                    return true;
                }
            }
        }
    });
    return false;
};

const updateStudent = (studentId, courseId) => {
    return new Promise((resolve, reject) => {
       const studentRef = db.collection('students').doc(studentId);
       studentRef.get().then((doc) => {
           const courses = doc.data().courses;
           if (!courses.contains(courseId)) {
               studentRef.update({
                   courses: admin.firestore.FieldValue.arrayUnion(courseId)
               }).then(() => {
                   resolve(true);
               }).catch((err) => {
                   reject(err);
               });
           } else {
               resolve(true);
           }
       }).catch((err) => {
            reject(err);
       });
    });
};

module.exports = {
    retrieveCourseList,
    retrieveStudent,
    retrieveFaculty,
    updateCourses
};
