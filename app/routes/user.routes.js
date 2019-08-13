//import module for verifying token
var VerifyToken = require('../../auth/VerifyToken');
//module exporting
module.exports = (app) => {
    //
    const users = require('../controllers/user.controller.js');
    const keys = require('../controllers/key.controller.js');
    
    // Create a new user
    app.post('/users',VerifyToken, users.create);

    // Authenticate a user
    app.post('/authenticate',VerifyToken, users.authenticate);

    // Retrieve all users
    app.get('/users',VerifyToken, users.findAll);

    // Retrieve a single users by email
    app.get('/users/:email',VerifyToken, users.findUser);

    // Update a user by email
    app.put('/users/:email',VerifyToken, users.update);

    // Delete a user with email
    app.delete('/users/:email',VerifyToken, users.delete);

     // Create a new key
     app.post('/keys', VerifyToken, keys.create);

     //Get all keys
     app.get('/keys', VerifyToken, keys.findAll);
 
     // Get all keys for one license
     app.get('/license/:license', VerifyToken, keys.findKeysByLicense);
 
     // Retrieve a single key by key_stockNo
     app.get('/keys/:key_stockNo', VerifyToken, keys.findKeyBykey_stockNo);
 
     // Update a key with key_stockNo
     app.put('/keys/:key_stockNo', VerifyToken, keys.update);
 
     // Delete a key with key_stockNo
     app.delete('/keys/:key_stockNo', VerifyToken, keys.delete);
}
