//import modules needed
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Admin = require('../app/models/admin.model');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Joi = require('@hapi/joi');
var config = require('../config/config');

//import module for using .env file
require('dotenv').config();

//set type of request data
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//Validation for insert creating and updating data
const insertUpdateValidation = data => {
  //set dafault of data validation
  const schema = {
    //username: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
  };
  return Joi.validate(data, schema);
}

//process for registering in admin database
router.post('/registerAdmin', async function (req, res) {

  //Lets validate data
  const { error } = insertUpdateValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message)

  //Checking if the user is already in the database
  const emailExist = await Admin.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('Email already exists');

  //Hash Passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //admin collection create
  Admin.create({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword
  },
    function (err, user) {
      if (err) return res.status(500).send({
        message: "There was a problem registering the user.",
        err: err.message
      });
      // create a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token });
    });
});

//register using promised email and password
router.post('/register', async function (req, res) {
  //Lets validate data
  const { error } = insertUpdateValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message)

  //confirm email and password vs promised email and password
  if (req.body.email !== process.env.adminEmail) return res.json({ 'auth': false, 'message': 'InValid Email' });
  if (req.body.password !== process.env.password) return res.json({ 'auth': false, 'message': 'InValid Password' });
  var token = jwt.sign({ email: process.env.adminEmail }, config.secret);
  res.status(200).send({ auth: true, token: token });
})

//exporting module
module.exports = router;