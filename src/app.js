const express = require('express')
const port     =  process.env.PORT  || 3000;
const host     = '0.0.0.0';
const app        = express();
const passport = require('passport');
const deserialize = require('./utilities/passport/passport.config')
const serialize = require('./utilities/passport/passport.config')
const index = require('./routes/index')
const bodyParser = require('body-parser');
const local_strategy = require('./utilities/passport/auth_strategy/local.strategy')
const jwt_strategy = require('./utilities/passport/auth_strategy/jwt.strategy')

passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,accept-language');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    next();
});

passport.use("local", local_strategy);
passport.use("jwt", jwt_strategy);

app.use(passport.initialize());
app.use("/", index);

module.exports = app