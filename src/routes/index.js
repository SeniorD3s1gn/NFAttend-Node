const users = require('./user');
const courses = require('./course');
const students = require('./students');
const faculty = require('./faculty');
const auth = require('./auth');
const attend = require('./attend');
const records = require('./records');

module.exports = {
    auth,
    users,
    courses,
    students,
    faculty,
    attend,
    records,
};
