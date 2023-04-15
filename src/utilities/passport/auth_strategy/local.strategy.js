const LocalStrategy = require('passport-local'),
                 db = require('../../../services/dbService'),
             bcrypt = require('bcryptjs'),
          constants = require('../../constants');

const local_strategy = new LocalStrategy({usernameField: 'email'},
    async function verify(email, password, cb) {
    const queryString = `SELECT * FROM remote_shopper WHERE email = "${email}"`;
    const user = await db.query(queryString).catch(err => {
        return cb(err);
    });
    if (user.length === 0) {
        return cb(null, false, constants.responseMessages.USER_NOT_FOUND);
    }
    const dbPassword = user[0].password;
    bcrypt.compare(password, dbPassword, function (err, hashedPassword) {
        if (hashedPassword === true) {
            return cb(null, user[0], constants.responseMessages.SUCCESS_LOGIN);
        } else {
            return cb(null, false, constants.responseMessages.WRONG_CREDENTIALS);
        }
    });
});

module.exports = local_strategy;