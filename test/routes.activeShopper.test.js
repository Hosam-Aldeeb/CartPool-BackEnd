const sinon = require('sinon');
const proxyquire = require("proxyquire");
const expect = require('expect.js');
let app;
const request = require('supertest');
const bcrypt = require("bcryptjs");
const { generateAuthTokens } = require("../src/services/tokenService");
let token;
const assert = require('assert');

(async () => {
    const tokenObj = await generateAuthTokens({
        email: "ankush.kv@gmail.com"
    });
    token = tokenObj.access.token;
})();

describe('Integration tests', function () {
    let mysqlStub, dbService, authLocalStrategyMock, authServiceMock, authRoute,
        activeShopperRoutes, indexRoute, remoteShopperRoutes, orderServiceMock
        , authJwtStrategyMock, userServiceMock;
    beforeEach(() => {
        proxyquire.noCallThru();
        mysqlStub = {
            createConnection: sinon.stub().returns({
                query: sinon.stub().resolves([]),
                connect: sinon.stub(),
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
        authLocalStrategyMock = proxyquire('../src/utilities/passport/auth_strategy/local.strategy', {
            '../../../services/dbService': dbService
        });
        authJwtStrategyMock = proxyquire('../src/utilities/passport/auth_strategy/jwt.strategy', {
            '../../../services/dbService': dbService
        });
        authServiceMock = proxyquire('../src/services/authService', {
            './dbService': dbService
        })
        userServiceMock = proxyquire('../src/services/userService', {
            './dbService': dbService
        })
        orderServiceMock = proxyquire('../src/services/orderService', {
            './dbService': dbService
        })
        activeShopperRoutes = proxyquire('../src/routes/activeShopper', {
            '../services/authService': authServiceMock,
            '../services/userService': userServiceMock,
            '../services/orderService': orderServiceMock
        });
        remoteShopperRoutes = proxyquire('../src/routes/remoteShopper', {
            '../services/authService': authServiceMock,
            '../services/orderService': orderServiceMock
        });
        authRoute = proxyquire('../src/routes/auth', {
            '../services/authService': authServiceMock
        })
        indexRoute = proxyquire('../src/routes/index', {
            './activeShopper': activeShopperRoutes,
            './auth': authRoute,
            './remoteShopper': remoteShopperRoutes
        })
        app = proxyquire('../src/app', {
            './routes/index': indexRoute,
            './utilities/passport/auth_strategy/local.strategy': authLocalStrategyMock,
            './utilities/passport/auth_strategy/jwt.strategy': authJwtStrategyMock
        });
    })
    it('when user logs in with a wrong password', async function () {
        sinon.stub(dbService, 'query').resolves([{
            email: "ankush.kv@gmail.com",
            password: "password_different"
        }]);
        const response = await request(app).post('/login')
            .send({
                email: "ankush.kv@gmail.com",
                password: "password"
            });
        expect(response._body.status).to.equal('error');
        expect(response._body.error_message).to.equal('FAIL_LOGIN');
        expect(response.statusCode).to.equal(400);
    });
    it('when user logs in with a correct password', async function () {
        sinon.stub(dbService, 'query').resolves([{
            email: "ankush.kv@gmail.com",
            password: await bcrypt.hash('password', 8)
        }]);
        const response = await request(app).post('/login')
            .send({
                email: "ankush.kv@gmail.com",
                password: "password"
            });
        expect(response._body.status).to.equal('success');
        expect(response.statusCode).to.equal(200);
    });
    it('register success', async function () {
        const stubInstance = sinon.stub(dbService, 'query')
        stubInstance.onCall(0).resolves([]);
        stubInstance.onCall(1).resolves([]);
        const response = await request(app).post('/register')
            .send({
                first_name: "Ankush",
                last_name: "Kumar",
                email: "ankush.kv@gmail.com",
                password: "password",
                phone_number: "212212324325"
            })
        sinon.assert.calledTwice(stubInstance);
        console.log(response._body);
        expect(response._body.status).to.equal('success');
        expect(response._body.data).to.equal('SUCCESS_REGISTERED');
        expect(response.statusCode).to.equal(200);
    });
    it('when unauthorised user calls an auth-required endpoint /listActiveShoppers', async function () {
        const response = await request(app).get('/listActiveShoppers')
            .set('Authorisation', 'Bearer unauth_token');
        expect(response._body.status).to.equal('error');
        expect(response._body.error_message).to.equal('UNAUTHORISED');
        expect(response.statusCode).to.equal(401);
    });
    it('when unauthorised user calls an auth-required endpoint /makeActiveShopper', async function () {
        const response = await request(app).post('/makeActiveShopper')
            .set('Authorisation', 'Bearer unauth_token');
        expect(response._body.status).to.equal('error');
        expect(response._body.error_message).to.equal('UNAUTHORISED');
        expect(response.statusCode).to.equal(401);
    });
    it('when unauthorised user calls an auth-required endpoint /createOrder', async function () {
        const response = await request(app).post('/createOrder')
            .set('Authorisation', 'Bearer unauth_token');
        expect(response._body.status).to.equal('error');
        expect(response._body.error_message).to.equal('UNAUTHORISED');
        expect(response.statusCode).to.equal(401);
    });
    it('when auth users call listActiveShoppers', async () => {
        const stubInstance = sinon.stub(dbService, 'query')
        stubInstance.onCall(0).resolves([{
            email: "ankush.kv@gmail.com"
        }]);
        stubInstance.onCall(1).resolves([{
            as_id: 4,
            first_name: "Ankush",
            last_name: "Kumar",
            address: "Zehrs",
            email: "ankush.kv@gmail.com"
        }]);
        stubInstance.onCall(2).resolves([{
            cnt: 0
        }]);
        const response = await request(app)
            .get('/listActiveShoppers')
            .set('authorization', `bearer ${token}`);
        assert.deepStrictEqual(response._body.data, [
            {
                as_id: 4,
                first_name: 'Ankush',
                last_name: 'Kumar',
                address: 'Zehrs',
                email: 'ankush.kv@gmail.com'
            }
        ]);
    });
    it('makeActiveShopper', async function () {
        const stubInstance = sinon.stub(dbService, 'query')
        stubInstance.onCall(0).resolves([{
            email: "ankush.kv@gmail.com"
        }]);
        stubInstance.onCall(1).resolves([]);
        stubInstance.onCall(2).resolves([{
            as_id: 4,
            first_name: "Ankush",
            last_name: "Kumar",
            address: "Zehrs",
            email: "ankush.kv@gmail.com"
        }]);
        stubInstance.onCall(3).resolves([]);
        stubInstance.onCall(4).resolves([
            {
                'LAST_INSERT_ID()': 4
            }
        ])
        const response = await request(app)
            .post('/makeActiveShopper')
            .set('authorization', `bearer ${token}`)
            .send({
                "email": "ankush.kv@gmail.com",
                "address": "Zehrs"
            });
        assert.deepStrictEqual(response._body.data, {as_id: 4, email: 'ankush.kv@gmail.com', address: 'Zehrs'});
    });
    it('createOrder', async function () {
        const stubInstance = sinon.stub(dbService, 'query')
        stubInstance.onCall(0).resolves([{
            email: "ankush.kv@gmail.com"
        }]);
        stubInstance.onCall(1).resolves([]);

        const response = await request(app)
            .post('/createOrder')
            .set('authorization', `bearer ${token}`)
            .send({
                active_shopper_id: 1,
                remote_shopper_id: 4,
                order_details: "2xApple,5XOrange"
            });
        expect(response._body.status).to.equal('success');
    });
    it('getOrderDetails', async function () {
        const stubInstance = sinon.stub(dbService, 'query')
        stubInstance.onCall(0).resolves([{
            email: "ankush.kv@gmail.com"
        }]);
        stubInstance.onCall(1).resolves([{
            as_id: 4,
            rs_id: 5,
            details: "2xApple,5XOrange",
            cost: 0
        }]);
        const response = await request(app)
            .get('/getOrderDetails')
            .set('authorization', `bearer ${token}`)
            .send({
                active_shopper_id: 1,
            });
        assert.deepStrictEqual(response._body.data, {})
    });
});