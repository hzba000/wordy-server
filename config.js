exports.CLIENT_ORIGIN = process.env.PORT || 8080;
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://testuser1:testuser1@ds131973.mlab.com:31973/capstone-test-server';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://testuser1:testuser1@ds039027.mlab.com:39027/capstone-test-server-test';
exports.PORT = process.env.PORT || 3000;

exports.JWT_SECRET = process.env.JWT_SECRET || 'default';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';



//You really need a local database