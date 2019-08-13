const Key = require('../models/key.model.js');
const bcrypt = require('bcryptjs');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
//Validation
const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
//Register Validation
const insertValidation = data => {

    const schema = {
        key_stockNo: Joi.string().required(),
        key_mac: Joi.string().required(),
        license: Joi.string().required(),
        last_detected_on: Joi.string().required(),
        last_detected_by: Joi.string().required(),
        last_signal_strength: Joi.string().required()
    };

    return Joi.validate(data, schema);
}
const updateValidation = data => {

    const schema = {
        key_mac: Joi.string().required(),
        license: Joi.string().required(),
        last_detected_on: Joi.string().required(),
        last_detected_by: Joi.string().required(),
        last_signal_strength: Joi.string().required()
    };

    return Joi.validate(data, schema);
}

// Create and Save a new User
exports.create = async (req, res) => {
    //Lets validate data
    const { error } = insertValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    //Checking if the key is already in the database
    const keyExist = await Key.findOne({ key_stockNo: req.body.key_stockNo });
    if (keyExist) return res.status(400).send('key already exists');
console.log(req.body.last_detected_on)
    // Create a key
    const key = new Key({
        'key_stockNo': req.body.key_stockNo,
        'key_mac': req.body.key_mac,
        'license': req.body.license,
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
    console.log("sdgfsdg")
    Key.find()
        .then(keys => {
            res.send(keys);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving keys."
            });
        });
};

// Find all keys with a license
exports.findKeysByLicense = (req, res) => {
    Key.find({ license: req.params.license })
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
    Key.find({ key_stockNo: req.params.key_stockNo })
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
// Update a user identified by the useremail in the request
exports.update = async (req, res) => {

    //Lets validate data
    const { error } = updateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    Key.findOneAndUpdate({ key_stockNo: req.params.key_stockNo }, {
        $set: {
            'key_mac': req.body.key_mac,
            'license': req.body.license,
            'last_detected_on': req.body.last_detected_on,
            'last_detected_by': req.body.last_detected_by,
            'last_signal_strength': req.body.last_signal_strength
        }
    }, { new: true }).exec(function (err, key) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).send(key);
        }
    });
};

// Delete a user with the specified useremail in the request
exports.delete = (req, res) => {
    Key.findOneAndRemove(req.params.key_stockNo)
        .then(key => {
            if (!key) {
                return res.status(404).send({
                    message: "Key not found with key_stockNo " + req.params.key_stockNo
                });
            }
            res.send({ message: "Key deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Key not found with email " + req.params.key_stockNo
                });
            }
            return res.status(500).send({
                message: "Could not delete key with email " + req.params.key_stockNo
            });
        });
};
