/*jshint esversion: 6 */const resObj = {
    "status" : "", // "success" / "error"
    // "error_code": "",
    "error_message" : "", //in case of error
    "data": {}
};

const statusMessage = {
    SUCCESS: "success",
    ERROR: "error"
};

module.exports = {getSuccess, getError, getNotFoundResponse, apiResponse}

function getSuccess(resData) {
    resObj.error_message = "";
    resObj.status = statusMessage.SUCCESS;
    resObj.data = resData;

    return JSON.stringify(resObj);
}

function getError(/*errCode,*/ errMsg) {
    resObj.status = statusMessage.ERROR;
    resObj.error_message = errMsg;
    resObj.data = {};
    
    return JSON.stringify(resObj);
}

function getNotFoundResponse(statusType) {
    resObj.error_message = "No data found for the given request.";
    resObj.status        = statusType;
    resObj.data          = {};

    return JSON.stringify(resObj);
}



async function apiResponse(res, resObj, statusCode = 200) {
    let contentType = 'application/json';
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    return res.status(statusCode).send(resObj);
}