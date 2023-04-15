const jwt = require("jsonwebtoken");
const dotenv    = require("dotenv")
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../../.env') });

const generateToken = (email, expires, secret = process.env.JWT_SECRET) => {
    const payload = {
        sub:email,
        iat:Math.floor(Date.now()/1000),
        exp:expires,
    };
    return jwt.sign(payload, secret);
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = Math.floor(Date.now()/1000)+ 60000000;
    const accessToken = generateToken(user.email, accessTokenExpires);
    return {
        access:{
            token:accessToken,
            expires:new Date(accessTokenExpires*10000),
        },
    };
};

module.exports = {
    generateToken,
    generateAuthTokens,
};
