const mysql     = require("mysql");
const util      = require("util");
const fs        = require('fs');
const path      = require("path")
const dotenv    = require("dotenv")
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    ssl: {ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}

});
// promise wrapper to enable async await with MYSQL
connection.query = util.promisify(connection.query).bind(connection);

// connect to the database
connection.connect(function(err){
    if (err) {
        console.log("error connecting: " + err.stack);
        return;
    }
    console.log("connected as... " + connection.threadId);
});

module.exports = connection;