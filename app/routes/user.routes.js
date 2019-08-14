//import module for verifying token
var VerifyToken = require('../../auth/VerifyToken');
//module exporting
module.exports = (app) => {
    //
    const users = require('../controllers/user.controller.js');
    //const keys = require('../controllers/key.controller.js');
    
    // Create a new user
    app.post('/users',VerifyToken, users.create);

    // Retrieve all users
    app.get('/users',VerifyToken, users.findAll);

    // Retrieve a single users by email
    app.get('/users/:email',VerifyToken, users.findUser);

    // Update a user by email
    app.put('/users/:email',VerifyToken, users.update);

    // Delete a user with email
    app.delete('/users/:email',VerifyToken, users.delete);
}
