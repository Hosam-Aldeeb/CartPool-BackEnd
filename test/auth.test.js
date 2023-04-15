const proxyquire = require('proxyquire');
const sinon = require("sinon");
const expect = require('expect.js');

describe("Auth test", () => {
    describe("Login", async () => {
        let mysqlStub, dbService, authServiceMock;
        beforeEach(() => {
            proxyquire.noCallThru();
            mysqlStub = {
                createConnection: sinon.stub().returns({
                    query: sinon.stub().resolves(),
                    connect: sinon.stub().resolves(),
                }),
            };
            dbService = proxyquire('../src/services/dbService', {
                'mysql': mysqlStub,
                'dotenv': {
                    config: () => {
                    },
                },
                'path': {
                    join: () => {
                    },
                },
            });
            authServiceMock = proxyquire('../src/services/authService', {
                './dbService': dbService
            })
        })
        it("required params not given", async () => {
            let req = {
                    body: {
                        "first_name": "john",
                        "last_name": "doe",
                        "email": "test_user121@gmail.com",
                    }
                },
                res = {
                    send: (value) => {
                        expect(value).to.equal("{\"status\":\"error\",\"error_message\":\"MISSING_REQUIRED_FIELDS\",\"data\":{}}");
                        return res;
                    },
                    set: () => {
                        return res
                    },
                    status: (value) => {
                        expect(value).to.equal(500)
                        return res
                    }
                };
            await authServiceMock.register(req, res);
        });
        it("required params given but user already exists", async () => {
            let req = {
                    body: {
                        "first_name": "john",
                        "last_name": "doe",
                        "email": "test_user121@gmail.com",
                        "password": "password",
                        "phone_number": "1234"
                    }
                },
                res = {
                    send: (val) => {
                        expect(val).to.equal("{\"status\":\"error\",\"error_message\":\"ALREADY_REGISTERED\",\"data\":{}}");
                        return res;
                    },
                    set: () => {
                        return res
                    },
                    status: (stat) => {
                        expect(stat).to.equal(400);
                        return res
                    }
                };
            sinon.stub(dbService, 'query').resolves([{
                first_name: "john",
                last_name: "doe",
                email: "jd@mail",
                phone_number: "123132424"
            }]);
            await authServiceMock.register(req, res);
        });
        it("new user registration success",async () => {
            let req = {
                    body: {
                        "first_name": "john",
                        "last_name": "doe",
                        "email": "test_user121@gmail.com",
                        "password": "password",
                        "phone_number": "1234"
                    }
                },
                res = {
                    send: (val) => {
                        expect(val).to.equal("{\"status\":\"success\",\"error_message\":\"\",\"data\":\"SUCCESS_REGISTERED\"}");
                        return res;
                    },
                    set: () => {
                        return res
                    },
                    status: (stat) => {
                        expect(stat).to.equal(200);
                        return res
                    }
                };
            sinon.stub(dbService, 'query').resolves([]);
            await authServiceMock.register(req, res);
        });
    });
});
