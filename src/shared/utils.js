const validateUser = (user) => {
    return user.first_name && user.last_name && user.email && user.password
};

const validateStudent = (student) => {
    return validateUser(student) && student.id && student.device
};

module.exports = {
    validateUser,
    validateStudent
};