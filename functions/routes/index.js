const users = require('./user');
const courses = require('./course');
const students = require('./students');
const faculty = require('./faculty');
const auth = require('./auth');
const attend = require('./attend');

module.exports = {
    auth,
    users,
    courses,
    students,
    faculty,
    attend
};
