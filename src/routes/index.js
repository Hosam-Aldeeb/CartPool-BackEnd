const express = require("express");
const router = express.Router();
const auth = require('./auth');
const activeShopper = require('./activeShopper');
const remoteShopper = require('./remoteShopper');


router.use("/", auth);

router.use("/", activeShopper);
router.use("/", remoteShopper);




module.exports = router;
