const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const dotenv    = require("dotenv")
const path = require("path");
const db = require("../../../services/dbService");
const constants = require("../../constants");
dotenv.config({ path: path.join(__dirname, '../../.env') });

const jwtOptions = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
    const email = payload.sub;
    let queryString = `SELECT * FROM remote_shopper WHERE email = "${email}"`;
    let user = await db.query(queryString).catch(err => {
        return done(err);
    });
    if (user.length === 0) {
        return done(null, false, constants.responseMessages.USER_NOT_FOUND);
    }
    done(null, user[0], constants.responseMessages.SUCCESS_LOGIN);
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = jwtStrategy;