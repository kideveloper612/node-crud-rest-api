//import needed modules
const Key = require('../models/key.model');
const User = require('../models/user.model');
//import module for authenticating
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//import env file
require('dotenv').config()
//import module for validation
const BaseJoi = require('@hapi/joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);

//Register Validation for insert data
const insertValidation = data => {
    //validation format of insert data
    const schema = {
        key_stockNo: Joi.string().required(),
        key_mac: Joi.string().required(),
        last_detected_on: Joi.date().format('YYYY-MM-DD HH:mm:SS'),
        last_detected_by: Joi.string().required(),
        last_signal_strength: Joi.string().required()
    };
    //validating nad return result
    return Joi.validate(data, schema);
}
//Register Validation for update data
const updateValidation = data => {
    //validation format of update data
    const schema = {
        key_stockNo: Joi.string(),
        key_mac: Joi.string().required(),
        license: Joi.string(),
        last_detected_on: Joi.string(),
        last_detected_by: Joi.string(),
        last_signal_strength: Joi.string()
    };
    //validating and return result
    return Joi.validate(data, schema);
}

//Register Validation for authenticating data
const authenticateValidation = data => {
    //validation format of authenticate data
    const schema = {
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    }
    //validating and return result
    return Joi.validate(data, schema);
}

//Authenticate using email
exports.authenticate = async function (req, res) {
    //Lets validate data
    const { error } = authenticateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //find user from user database using email
    User.findOne({ email: req.body.email }, async function (err, userInfo) {
        //return if error occurs
        if (err) {
            res.status(500).send({ status: "error", message: "Not found email!" });
            return (err);
        } else {
            //generate token using id and return the token
            if (userInfo != null && await bcrypt.compare(req.body.password, userInfo.password)) {
                const token = jwt.sign({ license: userInfo.license }, process.env.SECRET, { expiresIn: '1d' });
                res.json({ status: "success", message: "User found!!!", token: token });
            } else {
                //return if user does not exist and password does not match
                res.json({ status: "error", message: "Invalid email/password!!!", data: null });
            }
        }
    });
};

// Create and Save a new User
exports.create = async (req, res) => {
    //Lets validate data
    const { error } = insertValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checking if the key is already in the database
    const keyExist = await Key.findOne({ key_stockNo: req.body.key_stockNo, key_mac: req.body.key_mac, license: req.license });
    if (keyExist) return res.status(400).send('key already exists');

    if (!req.body.last_detected_on) req.body.last_detected_on = Date.now();

    // Create a key
    const key = new Key({
        'key_stockNo': req.body.key_stockNo,
        'key_mac': req.body.key_mac,
        'license': req.license,
        'last_detected_on': req.body.last_detected_on,
        'last_detected_by': req.body.last_detected_by,
        'last_signal_strength': req.body.last_signal_strength
    });

    // Save Key in the database
    key.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Key."
            });
        });
};

// Retrieve and return all keys from the database.
exports.findAll = (req, res) => {
    //find keys using license and return the result
    Key.find({ license: req.license })
        .then(key => {
            if (!key) {
                return res.status(404).send({
                    message: "Key not found with license " + req.params.license
                });
            }
            res.send(key);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Key not found with license " + req.params.license
                });
            }
            return res.status(500).send({
                message: "Error retrieving key with license " + req.params.license
            });
        });
};

// Find a single key with a key_stockNo
exports.findKeyBykey_stockNo = (req, res) => {
    //find a key using a key_stodkNo and return the result
    Key.find({ key_stockNo: req.params.key_stockNo, license: req.license })
        .then(key => {
            if (!key) {
                return res.status(404).send({
                    message: "Key not found with key_stockNo " + req.params.key_stockNo
                });
            }
            res.send(key);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Key not found with key_stockNo " + req.params.key_stockNo
                });
            }
            return res.status(500).send({
                message: "Error retrieving key with key_stockNo " + req.params.key_stockNo
            });
        });
};

// Update a user identified by the key_stockNo in the request
exports.update = async (req, res) => {

    //Lets validate data
    const { error } = updateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //get existing value in the database with email
    const existValue = await Key.find({
        key_stockNo: req.params.key_stockNo, key_mac: req.body.key_mac, license: req.license
    });
    //input current time if req.body.last_detected_on field is empty
    if (!req.body.last_detected_on) req.body.last_detected_on = existValue[0].last_detected_on;
    //use existing value if req.body.last_detected_by field is empty
    if (!req.body.last_detected_by) req.body.last_detected_by = existValue[0].last_detected_by;
    //use existing value if req.body.last_signal_strength is empty
    if (!req.body.last_signal_strength) req.body.last_signal_strength = last_signal_strength_value[0].last_signal_strength;

    //find a key with key_stockNo and return the result
    Key.findOneAndUpdate({ key_stockNo: req.params.key_stockNo, key_mac: req.body.key_mac, license: req.license }, {
        $set: {
            'key_stockNo': req.body.key_stockNo,
            'key_mac': req.body.key_mac,
            'license': req.license,
            'last_detected_on': req.body.last_detected_on,
            'last_detected_by': req.body.last_detected_by,
            'last_signal_strength': req.body.last_signal_strength
        }
    }, { new: true }).exec(function (err, key) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if (key) res.status(200).send(key);
            else res.status(400).send("Not exist key for updating.");
        }
    });
};

// Delete a user with the specified useremail in the request
exports.delete = (req, res) => {
    //find a key with key_stockNo and remove it
    Key.findOneAndRemove({ key_stockNo: req.params.key_stockNo, key_mac: req.body.key_mac, license: req.license })
        .then(key => {
            if (!key) {
                return res.status(404).send({
                    message: "Key not found with key_stockNo " + req.params.key_stockNo + " and key_mac " + req.body.key_mac
                });
            }
            res.send({ message: "Key deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Key not found with email " + req.params.key_stockNo + " and key_mac " + req.body.key_mac
                });
            }
            return res.status(500).send({
                message: "Could not delete key with email " + req.params.key_stockNo
            });
        });
};
