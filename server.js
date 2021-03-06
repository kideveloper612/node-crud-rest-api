//import needed modules
const express = require('express');
const bodyParser = require('body-parser');
// create express app and keyapp
const app = express();
const keyapp = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
keyapp.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
keyapp.use(bodyParser.json());

//Confgiuaring the database
const dbConfig = require('./config/database.config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//mongoose connecting
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log('Successfully connected to database!');
}).catch((err) => {
    console.log('Error occured in connecting to database!');
    process.exit();
});

// Require Notes routes
require('./app/routes/user.routes.js')(app);
require('./app/routes/key.routes.js')(keyapp);

// express doesn't consider not found 404 as an error so we need to handle 404 it explicitly
// handle 404 error
app.use(function(req, res, next) {
	let err = new Error('Not Found the url');
    err.status = 404;
    next(err);
});

// handle errors
app.use(function(err, req, res, next) {
	console.log(err);
  if(err.status === 404)
  	res.status(404).json({message: "Not found the url"});
  else	
    res.status(500).json({message: "Something looks wrong !!!", err: err});
});

// handle 404 error
keyapp.use(function(req, res, next) {
	let err = new Error('Not Found the url');
    err.status = 404;
    next(err);
});

// handle errors
keyapp.use(function(err, req, res, next) {
	console.log(err);
  if(err.status === 404)
  	res.status(404).json({message: "Not found the url"});
  else	
    res.status(500).json({message: "Something looks wrong !!!", err: err});
});

//create https server
const httpsPort_user = 3001;
const httpsPort_key = 3000;

var https = require('https');  
var fs = require('fs');  
var options = {  
    key: fs.readFileSync('./key.pem', 'utf8'),  
    cert: fs.readFileSync('./server.crt', 'utf8')  
}; 

https.createServer(options, app).listen(httpsPort_user, () => {  
    console.log("Server: Listening at port " + httpsPort_user);  
});  

https.createServer(options, keyapp).listen(httpsPort_key, () => {
    console.log("Server: Listening at port " + httpsPort_key);
})