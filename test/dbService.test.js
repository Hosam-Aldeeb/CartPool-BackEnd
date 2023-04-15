const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = require('expect.js');
const fs = require("fs");

let connectionMock;
let createConnectionStub;
let mysqlStub;
let dbService;

describe('DB Service', () => {
    beforeEach(() => {
        proxyquire.noCallThru();
        connectionMock = {
            query: sinon.stub().returns({ foo: 'bar' }),
            connect: sinon.stub(),
        };
        createConnectionStub = sinon.stub().returns(connectionMock);
        mysqlStub = {
            createConnection: createConnectionStub,
        };
        dbService = proxyquire('../src/services/dbService', {
            mysql: mysqlStub,
        });
    })

    it('should create a connection with the correct configuration', () => {
        sinon.assert.calledWith(mysqlStub.createConnection, {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE,
            ssl: {ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}
        });
    });

    it('should call the connect method of the connection', () => {
        sinon.assert.calledOnce(connectionMock.connect);
    });
});
