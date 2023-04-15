const orderService = require('../services/orderService');
const authService  = require("../services/authService");


const express      = require("express");
const router       = express.Router();


router.post("/createOrder" , authService.authorize ,  orderService.createOrderByRemoteShopper);


module.exports = router;