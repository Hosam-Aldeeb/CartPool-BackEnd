const db                        = require("./dbService");
const constants                 = require("../utilities/constants");
const { getSuccess, getError,apiResponse }  = require("../utilities/apiResponse");


async function makeActiveShopper(req, res) {
    var email   = req.body.email;
    var address = req.body.address;

    if(!email || !address){
        return apiResponse(res, getError(constants.responseMessages.MISSING_REQUIRED_FIELDS), 500);
    }
    //check already having same active shopper entry then only update adderss
    let activequeryString = `SELECT * FROM active_shopper WHERE email = "${email}"`;
    
    let activeUser        = await db.query(activequeryString).catch(ex => {
        return apiResponse(res, getError(constants.responseMessages.FAIL_REGISTERED), 400);
    });
    if(activeUser && activeUser.length >0 ){
        let updateAddressqueryString = `UPDATE active_shopper SET address = '${address}' WHERE email = "${email}"`;
        await db.query(updateAddressqueryString);
        let resObj = {
            as_id : activeUser[0].rs_id,
            email : email,
            address : address
        }
        return apiResponse(res, getSuccess(resObj), 200);
    }

    //else it is new entry
    let queryString = `SELECT * FROM remote_shopper WHERE email = "${email}"`;
    
    let fetchUser = await db.query(queryString).catch(ex => {
        return apiResponse(res, getError(constants.responseMessages.FAIL_REGISTERED), 400);
    });

    if (fetchUser && fetchUser.length > 0) {
        let last_name         = fetchUser[0].last_name;
        let first_name        = fetchUser[0].first_name;
        let email             = fetchUser[0].email;
        let phone_number      = fetchUser[0].phone_number;


        let queryString = `INSERT INTO active_shopper 
                          (last_name, first_name, email, phone_number, address, is_active)
                           VALUES ('${last_name}', '${first_name}', '${email}', '${phone_number}','${address}', 1); `;

        await db.query(queryString);
        let last_inserted_id = `SELECT LAST_INSERT_ID()`;
        let response = await db.query(last_inserted_id);
        let resObj = {
            as_id : response[0]['LAST_INSERT_ID()'],
            email : email,
            address : address
        }
        return apiResponse(res, getSuccess(resObj), 200);

    }else {
        return apiResponse(res, getError(constants.responseMessages.FAILURE), 500);
    }
}

async function listActiveShoppers(req, res) {

    let queryString = `SELECT as_id,first_name,last_name,address,email  FROM active_shopper where is_active = 1`;
    let fetchUser = await db.query(queryString);
    let final_list = []
    if (fetchUser && fetchUser.length > 0) {
        for (let i = 0; i < fetchUser.length; i++) {
            let poolOrderCountQuery = `SELECT COUNT(*) as cnt FROM pool_orders where as_id = ${fetchUser[i].as_id}`;
            let count = await db.query(poolOrderCountQuery);
            if (count[0].cnt === 0) {
                final_list.push(fetchUser[i]);
            }
        }
         return apiResponse(res, getSuccess(final_list),200);
    }else{
        return apiResponse(res, getError(constants.responseMessages.FAILURE), 500);
    }
}


exports.makeActiveShopper  = makeActiveShopper;
exports.listActiveShoppers = listActiveShoppers;


