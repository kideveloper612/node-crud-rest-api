//import module for verifying token
var VerifyToken = require('../../auth/VerifyToken');
//module exporting
module.exports = (app) => {
    //import needed module
    const keys = require('../controllers/key.controller.js');

    // Authenticate a user
    app.post('/authenticate', keys.authenticate);

    // Create a new key
    app.post('/keys', VerifyToken, keys.create);

    //Get all keys
    app.get('/keys', VerifyToken, keys.findAll);

    // Get all keys for one license
    // app.get('/license/:license', VerifyToken, keys.findKeysByLicense);

    // Retrieve a single key by key_stockNo
    app.get('/keys/:key_stockNo', VerifyToken, keys.findKeyBykey_stockNo);

    // Update a key with key_stockNo
    app.put('/keys/:key_stockNo', VerifyToken, keys.update);

    // Delete a key with key_stockNo
    app.delete('/keys/:key_stockNo', VerifyToken, keys.delete);
}
