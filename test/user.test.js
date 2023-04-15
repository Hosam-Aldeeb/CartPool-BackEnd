const proxyquire = require('proxyquire');
const sinon = require("sinon");
const expect = require('expect.js');

describe("User service test", () => {
    describe("MarkActive shopper and listAllActiveShopper", async () => {
        let mysqlStub, dbService, userServiceMock;
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
            userServiceMock = proxyquire('../src/services/userService', {
                './dbService': dbService
            })
        })
        it("MarkActive when required params not given", async () => {
            let req = {
                    body: {}
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
            await userServiceMock.makeActiveShopper(req, res);
        });
        it("MarkActive when required params given", async () => {
            let req = {
                    body: {
                        email: "jd@mail",
                        address: "Zehrs"
                    }
                },
                res = {
                    send: (val) => {
                        expect(val).to.equal("{\"status\":\"success\",\"error_message\":\"\",\"data\":{\"email\":\"jd@mail\",\"address\":\"Zehrs\"}}");
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
            sinon.stub(dbService, 'query').resolves([{
                first_name: "john",
                last_name: "doe",
                email: "jd@mail",
                phone_number: "123132424"
            }]);
            await userServiceMock.makeActiveShopper(req, res);
        });
        it("MarkActive when required params given but db throws exception", async () => {
            let req = {
                    body: {
                        email: "jd@mail",
                    }
                },
                res = {
                    send: sinon.stub(),
                    status: sinon.stub().returnsThis(),
                    set: sinon.stub().returnsThis()
                };
            sinon.stub(dbService, 'query').rejects()
            await userServiceMock.makeActiveShopper(req, res);
        });
        it("listActiveShoppers when at least one active shopper exists", async () => {
            let req = {
                    body: {
                        email: "jd@mail",
                    }
                },
                res = {
                    send: (val) => {
                        expect(val).to.equal("{\"status\":\"success\",\"error_message\":\"\"," +
                            "\"data\":[{\"first_name\":\"john\",\"last_name\":\"doe\"}]}")
                        return res;
                    },
                    status: (stat) => {
                        expect(stat).to.equal(200)
                        return res;
                    },
                    set: sinon.stub().returnsThis()
                };
            const myStub = sinon.stub(dbService, 'query')
            myStub.onCall(0).returns([{
                first_name: "john",
                last_name: "doe"
            }]);
            myStub.onCall(1).returns([{ cnt: 0 }]);
            await userServiceMock.listActiveShoppers(req, res);
        });
        it("listActiveShoppers when zero active shoppers exist", async () => {
            let req = {
                    body: {
                        email: "jd@mail",
                    }
                },
                res = {
                    send: (val) => {
                        expect(val).to.equal("{\"status\":\"error\",\"error_message\":\"FAILURE\",\"data\":{}}")
                        return res;
                    },
                    status: (stat) => {
                        expect(stat).to.equal(500)
                        return res;
                    },
                    set: sinon.stub().returnsThis()
                };
            const myStub = sinon.stub(dbService, 'query');
            myStub.onCall(0).returns([]);
            myStub.onCall(1).returns([{cnt:0}]);
            await userServiceMock.listActiveShoppers(req, res);
        });
    });
});
