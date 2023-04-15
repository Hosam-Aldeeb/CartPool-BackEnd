const authService = require("../services/authService");
const userService = require("../services/userService");
const orderService = require('../services/orderService');

const express = require("express");
const router = express.Router();

router.post("/makeActiveShopper", authService.authorize,  userService.makeActiveShopper);

router.get("/listActiveShoppers", authService.authorize,  userService.listActiveShoppers);

router.get("/getOrderDetails" ,   authService.authorize , orderService.getOrderDetails);


module.exports = router;