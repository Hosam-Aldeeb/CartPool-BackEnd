const passport = require("passport");
const constants = require("../utilities/constants");
const {apiResponse, getError, getSuccess} = require("../utilities/apiResponse");
const db = require("./dbService");
const bcrypt = require("bcryptjs");
const token_service = require('../services/tokenService')

async function authenticate(req, res, next) {
    passport.authenticate('local', async function (err, user, info) {
        if (err) {
            return next(err)
        }
        if (user === false) {
            if (info === constants.responseMessages.USER_NOT_FOUND)
                return apiResponse(res, getError(constants.responseMessages.USER_NOT_FOUND), 400);
            else if (info === constants.responseMessages.WRONG_CREDENTIALS)
                return apiResponse(res, getError(constants.responseMessages.FAIL_LOGIN), 400);
            else
                return apiResponse(res, getError(info.message), 400);
        }
        const auth_token = await token_service.generateAuthTokens(user);
        
        let resObj = {first_name : user.first_name, last_name : user.last_name, email  : user.email, auth_token,
                     address : user.address};

        return apiResponse(res, getSuccess(resObj),200);
    })(req, res, next);
}

async function register(req, res) {
    let first_name   = req.body.first_name || null;
    let last_name    = req.body.last_name || null;
    let email        = req.body.email || null;
    let password     = req.body.password || null;
    let phone_number = req.body.phone_number || null;
    let address      = req.body.address || null;

    if (!first_name || !last_name || !email || !password || !phone_number) {
        return apiResponse(res, getError(constants.responseMessages.MISSING_REQUIRED_FIELDS), 500);
    }
    let queryString = `SELECT email FROM remote_shopper WHERE email = "${email}"`;
    
    let fetchUser = await db.query(queryString).catch(ex => {
        return apiResponse(res, getError(constants.responseMessages.FAIL_REGISTERED), 400);
    });
    if (fetchUser && fetchUser.length > 0) {
        return apiResponse(res, getError(constants.responseMessages.ALREADY_REGISTERED), 400);
    } else {
        let hashedPassword = await bcrypt.hash(password, 8);

        let queryString = `INSERT INTO remote_shopper SET 
                        first_name   =  "${first_name}", 
                        last_name    =  "${last_name}", 
                        email        =  "${email}",
                        phone_number =  "${phone_number}", 
                        password     =  "${hashedPassword}",
                        address      =  "${address}"`;
        await db.query(queryString).catch(ex => {
            return apiResponse(res, getError(constants.responseMessages.FAIL_REGISTERED), 400);
        });
        return apiResponse(res, getSuccess(constants.responseMessages.SUCCESS_REGISTERED), 200);
    }
}

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
    if (err || user === false) {
        return reject('Please authenticate');
    }
    req.user = user;
    resolve();
};

const authorize = async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate(
            "jwt",
            {session: false},
            verifyCallback(req, resolve, reject)
        )(req, res, next);
    }).then(() => {
        next()
    }).catch((err) => {
        return apiResponse(res, getError(constants.responseMessages.UNAUTHORISED), 401);
    });
};

module.exports = {
    authorize,
    authenticate,
    register
}