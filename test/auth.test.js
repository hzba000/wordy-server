const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const {JWT_SECRET, JWT_EXPIRY } = require('../config');
const { startServer, stopServer, app } = require('../server.js');
const { User } = require('../user/user.model');

const expect = chai.expect;
chai.use(chaiHttp);

//sets up our test suite
describe('Integration tests for: /api/auth', function () {
    let testUser, jwtToken;

    //Before each test suite make sure the server is on
    before(function () {
        return startServer(true);
    });

    //Before each test, create a fake user and return the hashed password that is generated
    beforeEach(function () {
        testUser = createFakerUser();

        return User.hashPassword(testUser.password).then(hashedPassword => {
            return User.create({
                name: testUser.name,
                email: testUser.email,
                username: testUser.username,
                password: hashedPassword
            })

            //The created user object continues down the promise chain
                .then(createdUser => {
                    testUser.id = createdUser.id; //sets our fake user's id to testUser.id
                    
                    //Creates a JSON web token for the fake user
                    jwtToken = jsonwebtoken.sign(
                        {
                            user: {
                                id: testUser.id,
                                name: testUser.name,
                                email: testUser.email,
                                username: testUser.username
                            }
                        },
                        JWT_SECRET,
                        {
                            algorithm: 'HS256',
                            expiresIn: JWT_EXPIRY,
                            subject: testUser.username
                        }
                    );
                })
                .catch(err => {
                    console.error(err);
                });
          });
    });

    afterEach(function () {
        return new Promise((resolve, reject) => {
            // Deletes the entire database.
            mongoose.connection.dropDatabase()
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
          });
    });

    //After each test, stop the server so that errors aren't thrown when other tests are run
    after(function () {
        return stopServer();
    });

    //First Test in our suite
    it('Should login correctly and return a valid JSON Web Token', function () {
        return chai.request(app)
            .post('/api/auth/login') //Make a fake post request
            .send({                  //Sending fake credentials
                username: testUser.username,
                password: testUser.password
            })
            .then(res => {          //The response sent back to the client should have these traits...
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('jwtToken');

                const jwtPayload = jsonwebtoken.verify(res.body.jwtToken, JWT_SECRET, {
                    algorithm: ['HS256']
                });
                expect(jwtPayload.user).to.be.a('object');
                expect(jwtPayload.user).to.deep.include({
                    username: testUser.username,
                    email: testUser.email,
                    name: testUser.name
                });
          });
    });
    //This tests refresh ability of JSON web token
    it('Should refresh the user JSON Web Token', function () {
        const firstJwtPayload = jsonwebtoken.verify(jwtToken, JWT_SECRET, {
            algorithm: ['HS256'] //Verify the original token
             });
        return chai.request(app)
            .post('/api/auth/refresh') //make a fake request to this endpoint
            .set('Authorization', `Bearer ${jwtToken}`) //Make sure the JWT token is indicated in bearer
            .then(res => { //The new token sent back should have these characteristics
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('jwtToken');

                const newJwtPayload = jsonwebtoken.verify(res.body.jwtToken, JWT_SECRET, {
                    algorithm: ['HS256'] //Verify the new token
                });
                expect(newJwtPayload.user).to.be.a('object'); //expect the new JSON Web Token to have these characteristics
                expect(newJwtPayload.user).to.deep.include({
                    username: testUser.username,
                    email: testUser.email,
                    name: testUser.name
                });

                expect(newJwtPayload.exp).to.be.at.least(firstJwtPayload.exp); //Watching expiry date
            });
    });

    function createFakerUser() { //Creates a fake user for us to test with
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            username: `${faker.lorem.word()}${faker.random.number(100)}`,
            password: faker.internet.password(),
            email: faker.internet.email()
        };
    }
});