const Router = require('express');
const admin = require('firebase-admin');
const env = require('../environment-variables');
const shared = require('../shared/utils');

const KEY = env.apiKey;

const router = Router();

const db = admin.firestore();

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }

    const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        faculty: req.body.faculty,
    };

    createAuthenticatedUser(user).then((response) => {
        console.log('added new user to auth: ', response);
        if (user.faculty) {
            insertAsFaculty({ ...user, id: response }).then((result) => {
                console.log('added new faculty to firestore: ', result.id);
                res.send({ message: 'ok', id: result.id });
            }).catch((err) => {
                console.log('could not add new faculty to firestore: ', err);
                res.send(err);
                deleteUser(response).then((resolve) => {
                    console.log('user has been deleted: ', resolve);
                }).catch((reject) => {
                    console.log('user could not be deleted: ', reject);
                });
            });
        } else {
            const student = { ...user, device: req.body.device };
            insertAsStudent(student).then((result) => {
                console.log('add new student to firestore: ', result);
                res.send(result.id);
            }).catch((err) => {
                console.log('could not add new student to firestore: ', err);
                res.send(err);
                deleteUser(response).then((resolve) => {
                    console.log('user has been deleted: ', resolve);
                }).catch((reject) => {
                    console.log('user could not be deleted: ', reject);
                });
            })
        }
    }).catch((err) => {
        console.log('could not add new user to auth: ', err);
        res.send(err);
    })
});

const createAuthenticatedUser = (user) => {
    return new Promise((resolve, reject) => {
        if (!shared.validateUser(user)) {
            reject('One of the user values is null...');
            return;
        }
        admin.auth().createUser({
            displayName: user.first_name + ' ' + user.last_name,
            email: user.email,
            password: user.password,
        }).then((record) => {
            resolve(record.uid);
        }).catch((err) => {
            reject(err);
        });
    });
};

const insertAsStudent = (student) => {
    return new Promise((resolve, reject) => {
       if (!shared.validateStudent(student)) {
           reject('One or more of the student values is blank');
           return;
       }
       db.collection('students').doc(student.id).set({
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          device: student.device,
       }).then(() => {
           resolve(student.id);
       }).catch((err) => {
           reject(err);
       });
    });
};

const insertAsFaculty = (faculty) => {
    return new Promise((resolve, reject) => {
       if (!shared.validateUser(faculty)) {
           reject('One or more of the faculty values is blank');
           return;
       }
       db.collection('faculty').doc(faculty.id).set({
           first_name: faculty.first_name,
           last_name: faculty.last_name,
           email: faculty.email,
       }).then((ref) => {
           resolve(ref);
       }).catch((err) => {
           reject(err);
       })
    });
};

const deleteUser = (uid) => {
    return new Promise((resolve, reject) => {
        admin.auth().deleteUser(uid).then(() => {
            resolve(uid);
        }).catch((err) => {
            reject(err);
        })
    });
};

router.get('/:email', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
    admin.auth().getUserByEmail(req.params.email).then((record) => {
        console.log('Successfully fetched user data: ', record.toJSON());
        res.sendStatus(200);
    }).catch((err) => {
        console.log('Error fetching user data: ', err);
        res.sendStatus(404);
    });
});

router.delete('/:email', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401).end();
    }
   admin.auth().getUserByEmail(req.params.email).then((record) => {
       admin.auth().deleteUser(record.uid).then(() => {
           console.log('Successfully deleted user: ', record.uid);
           res.sendStatus(202);
       }).catch((err) => {
           console.log('Error deleting user: ', err);
           res.sendStatus(400);
       });
   }).catch((err) => {
        console.log('Error fetching user data: ', err);
        res.sendStatus(404);
   });
});

module.exports = router;
