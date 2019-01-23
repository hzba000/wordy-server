const chai = require('chai');
const chaiHttp = require('chai-http');

const { startServer, stopServer, app } = require('../server.js');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for: /', function () {
    before(function () {
        return startServer(true);
    });

    after(function () {
        return stopServer();
    });

    it('Should return index.html', function () {
        chai.request(app)
            .get('/') //Makes sure that when root is accessed, server is appropriately serving static assets
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
                expect(res.text).to.have.string('<!DOCTYPE html>');
            });
    });
});