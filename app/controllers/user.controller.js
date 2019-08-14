//import needed modules
const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
//Validation
const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
//Register Validation in insert data
const insertValidation = data => {
    //insert data validaion format
    const schema = {
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        companyName: Joi.string().required(),
        companyPhone: Joi.string().required(),
        contactName: Joi.string().required(),
        address: Joi.string().required(),
        license: Joi.string().required(),
        isActive: Joi.boolean().required()
    };
    //validation insert data on schema
    return Joi.validate(data, schema);
}
//Register Validation in update data
const updateValidation = data => {
    //updata data validation format
    const schema = {
        password: Joi.string().min(6).required(),
        companyName: Joi.string().required(),
        companyPhone: Joi.string().required(),
        contactName: Joi.string().required(),
        address: Joi.string().required(),
        license: Joi.string().required(),
        isActive: Joi.boolean().required()
    };
    //validation updata data on schema
    return Joi.validate(data, schema);
}
// Create and Save a new User
exports.create = async (req, res) => {
    //Lets validate data
    const { error } = insertValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    //Checking if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exists');

    //Hash Passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a User
    const user = new User({
        password: hashedPassword || "Untitled User",
        email: req.body.email,
        companyName: req.body.companyName,
        companyPhone: req.body.companyPhone,
        contactName: req.body.contactName,
        address: req.body.address,
        license: req.body.license,
        isActive: req.body.isActive,
        tokens: []
    });
    //input token in database as a array
    user.tokens.push({ token: req.headers['access-token'] });

    // Save User in the database
    user.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        });
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    //find all users from database
    User.find()
        .then(users => {
            //send all users if all is success
            res.send(users);
        }).catch(err => {
            //send error if error occurs
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving users."
            });
        });
};

// Find a single user with a useremail
exports.findUser = (req, res) => {
    //find a user from database using email
    User.findOne({ email: req.params.email })
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with email " + req.body.email
                });
            }
            res.send(user);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with email " + req.body.email
                });
            }
            return res.status(500).send({
                message: "Error retrieving user with email " + req.body.email
            });
        });
};

// Update a user identified by the useremail in the request
exports.update = async (req, res) => {

    //Lets validate data
    const { error } = updateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    //Hash Passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //find a user form database using email and update the user data
    User.findOneAndUpdate({ email: req.params.email }, {
        $set: {
            'password': hashedPassword,
            'companyName': req.body.companyName,
            'companyPhone': req.body.companyPhone,
            'contactName': req.body.contactName,
            'address': req.body.address,
            'license': req.body.license,
            'isActive': req.body.isActive
        }
    }, { new: true }).exec(function (err, user) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).send(user);
        }
    });
};

// Delete a user with the specified useremail in the request
exports.delete = (req, res) => {
    //find a user from database using email and remove it
    User.findOneAndRemove(req.params.email)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with email " + req.body.email
                });
            }
            res.send({ message: "User deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "User not found with email " + req.body.email
                });
            }
            return res.status(500).send({
                message: "Could not delete user with email " + req.body.email
            });
        });
};
