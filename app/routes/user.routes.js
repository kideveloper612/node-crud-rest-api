//module exporting
module.exports = (app) => {
    //import needed module
    const users = require('../controllers/user.controller.js');
    
    // Create a new user
    app.post('/users', users.create);

    // Retrieve all users
    app.get('/users', users.findAll);

    // Retrieve a single users by email
    app.get('/users/:email', users.findUser);

    // Update a user by email
    app.put('/users/:email', users.update);

    // Delete a user with email
    app.delete('/users/:email', users.delete);
}