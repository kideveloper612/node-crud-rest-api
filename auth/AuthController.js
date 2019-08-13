var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var Admin = require('../app/models/admin.model');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Joi = require('@hapi/joi');

var config = require('../config/config');

var VerifyToken = require('./VerifyToken');

const insertUpdateValidation = data => {

  const schema = {
      username: Joi.string().min(6).required(),
      email: Joi.string().min(6).required().email(),
      password: Joi.string().min(6).required()
  };

  return Joi.validate(data, schema);
}
router.post('/register',async function (req, res) {

  //Lets validate data before we a user
  const { error } = insertUpdateValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message)

  //Checking if the user is already in the database
  const emailExist = await Admin.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('Email already exists');

  //Hash Passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

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


router.post('/login', async function (req, res) {

  Admin.findOne({ email: req.body.email }, async function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    
    var passwordIsValid = bcrypt.compare(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token });
  });

});

router.get('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: null });
});
module.exports = router;