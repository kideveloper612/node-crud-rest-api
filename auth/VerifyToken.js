//import needed modules
var jwt = require('jsonwebtoken');
require('dotenv').config();

//token verify
function verifyToken(req, res, next) {
  //get token from request
  var token = req.headers['access-token'];
  //return if token does not exist
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });
  //confirm if request token matches to registered token
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.license = decoded.license;
    next();
  });
}

//module exporting
module.exports = verifyToken;