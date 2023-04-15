
const constants = require("../utilities/constants");
const {apiResponse, getError, getSuccess} = require("../utilities/apiResponse");
const db = require("./dbService");


async function createOrderByRemoteShopper(req, res) {
    let active_shopper_id  = req.body.active_shopper_id;
    let remote_shopper_id  = req.body.remote_shopper_id; 
    let order_details      = req.body.order_details;

    if (!active_shopper_id || !remote_shopper_id || !order_details) {
        return apiResponse(res, getError(constants.responseMessages.MISSING_REQUIRED_FIELDS), 400);
    }
    //status 1 denotes create order
    let queryString = `INSERT INTO pool_orders 
    (rs_id, as_id, cost, details, status, created_at, updated_at)
     VALUES ('${remote_shopper_id}', '${active_shopper_id}', '0', '${order_details}', 1 , NOW(), NOW()); `;

     let insertOrder = await db.query(queryString);
     
     return apiResponse(res, getSuccess({id : insertOrder.insertId}),200);
}

async function getOrderDetails(req, res) {
    let active_shopper_id  = req.query.active_shopper_id;
    if (!active_shopper_id) {
        return apiResponse(res, getError(constants.responseMessages.MISSING_REQUIRED_FIELDS), 400);
    }
    let queryString = `Select * FROM  pool_orders WHERE as_id = ${active_shopper_id}`;
    let getOrderDetails =  await db.query(queryString);

    if (getOrderDetails && getOrderDetails.length > 0) {
        return apiResponse(res, getSuccess(getOrderDetails),200);
    }else{
        return apiResponse(res, getError(constants.responseMessages.FAILURE), 500);
    }
}


exports.createOrderByRemoteShopper         = createOrderByRemoteShopper;
exports.getOrderDetails                    = getOrderDetails;