const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const {JWT_SECRET, JWT_EXPIRY } = require('../config');
const { startServer, stopServer, app } = require('../server.js');
const { User } = require('../user/user.model');
const { Word } = require('../word/word.model');

const expect = chai.expect; 
chai.use(chaiHttp); 

describe('Integration tests for: /api/word', function () {
    let testUser, jwtToken;

    //The reason we put true here, is to differentiate our test and production servers in the startServer function in server.js
    before(function () {
        return startServer(true);
    });


    beforeEach(function () {
        testUser = createFakerUser(); //We need a fake user to test on, so we create one here

        return User.hashPassword(testUser.password)
            .then(hashedPassword => {
                return User.create({
                    name: testUser.name,
                    email: testUser.email,
                    username: testUser.username,
                    password: hashedPassword
                }).catch(err => {
                    throw new Error(err);
                });
            })
            .then(createdUser => { //Make sure that user has a JSON Web token to authenticate them before we test their data
                testUser.id = createdUser.id;

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

                const seedData = []; //Seed 10 dummy data words
                for (let i = 1; i <= 10; i++) {
                    const newWord = createFakerWord();
                    newWord.user = createdUser.id;
                    seedData.push(newWord);
                }
                return Word.insertMany(seedData)
                    .catch(err => {
                        throw new Error(err);
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
                    reject(err);
                });
        });
    });

    after(function () {
        return stopServer();
    });

    it('Should return user words', function () {
        return chai.request(app)
            .get('/api/word') //Make a fake get Request
            .set('Authorization', `Bearer ${jwtToken}`) //Make sure JWT token is recognized
            .then(res => { //Words sent back in response object should meet these characteristics
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);
                const word = res.body[0];
                expect(word).to.include.keys('user', 'words', 'definitions', 'images', 'audio', 'listenhighscore', 'imagehighscore', 'definitionhighscore');
                expect(word.user).to.be.a('object');
                expect(word.user).to.include.keys('name', 'email', 'username');
                expect(word.user).to.deep.include({
                    id: testUser.id,
                    username: testUser.username,
                    email: testUser.email,
                    name: testUser.name
                });
        });
    });

    it('Should return a specific word', function () {//The main difference here is the addition of a parameterized id
        let foundWord;
        return Word.find()
            .then(words => {
                expect(words).to.be.a('array');
                expect(words).to.have.lengthOf.at.least(1); // ensures seeding worked
                foundWord = words[0];

                return chai.request(app)
                    .get(`/api/word/${foundWord.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`); //jwt token bearer authorization
            })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('user', 'words', 'definitions', 'images', 'audio', 'listenhighscore', 'imagehighscore', 'definitionhighscore');
                expect(res.body).to.deep.include({
                    id: foundWord.id,
                    words: foundWord.words,
                    definitions: foundWord.definitions,
                    images: foundWord.images,
                    audio: foundWord.audio,
                    listenhighscore: foundWord.listenhighscore,
                    imagehighscore: foundWord.imagehighscore,
                    definitionhighscore: foundWord.definitionhighscore

                });
        });
    });

    it('Should update a specific word', function () {//We should get a 204 code back (empty response object)
        let wordToUpdate;
        const newWordData = createFakerWord();
        return Word.find()
            .then(words => {
                expect(words).to.be.a('array');
                expect(words).to.have.lengthOf.at.least(1); // ensures seeding worked
                wordToUpdate = words[0];

                return chai.request(app)
                    .put(`/api/word/${wordToUpdate.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .send(newWordData);
            })
            .then(res => {
                expect(res).to.have.status(204);

                return Word.findById(wordToUpdate.id);
            })
            .then(word => {
                expect(word).to.be.a('object');
                expect(word).to.deep.include({
                    id: wordToUpdate.id,
                    words: newWordData.words,
                    definitions: newWordData.definitions,
                    images: newWordData.images,
                    audio: newWordData.audio,
                    listenhighscore: newWordData.listenhighscore,
                    imagehighscore: newWordData.imagehighscore,
                    definitionhighscore: newWordData.definitionhighscore
                });
        });
    });

    it('Should delete a specific word', function () {//We chould get back a 204 code back (empty response object)
        let wordToDelete;
        return Word.find()
            .then(words => {
                expect(words).to.be.a('array');
                expect(words).to.have.lengthOf.at.least(1); //ensures seeding worked
                wordToDelete = words[0];

                return chai.request(app)
                    .delete(`/api/word/${wordToDelete.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`);
            })
            .then(res => {
                expect(res).to.have.status(204);

                return Word.findById(wordToDelete.id);
            })
            .then(word => {
                expect(word).to.not.exist;
            });
    });

    function createFakerUser() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            username: `${faker.lorem.word()}${faker.random.number(100)}`,
            password: faker.internet.password(),
            email: faker.internet.email()
        };
    }

    function createFakerWord() {
        return {
            words: ['hello', 'banana'],
            definitions: ['hello', 'banana'],
            images: ['hello', 'banana'],
            audio: ['hello', 'banana'],
            listenhighscore: faker.random.number(),
            imagehighscore: faker.random.number(),
            definitionhighscore: faker.random.number()
            // title: faker.lorem.sentence(),
            // content: faker.lorem.paragraphs()
        };
    }
});