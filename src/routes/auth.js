const express = require("express");
const router = express.Router();
const authService = require('../services/authService');

router.post('/login', authService.authenticate);

router.post('/register', authService.register);

router.get("/authorizedRouteTest", authService.authorize, (req, res) => {
    res.send("Authorized space");
});

module.exports = router;