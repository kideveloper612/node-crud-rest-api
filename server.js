//import needed modules
const express = require('express');
const bodyParser = require('body-parser');
const authRoute = require('./auth/AuthController');
// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());

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

//register and login
app.use('/', authRoute);

// express doesn't consider not found 404 as an error so we need to handle 404 it explicitly
// handle 404 error
app.use(function(req, res, next) {
	let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// handle errors
app.use(function(err, req, res, next) {
	console.log(err);
  if(err.status === 404)
  	res.status(404).json({message: "Not found"});
  else	
    res.status(500).json({message: "Something looks wrong !!!", err: err});
});

//create https server
const httpsPort = 3000;  
var https = require('https');  
var fs = require('fs');  
var options = {  
    key: fs.readFileSync('./key.pem', 'utf8'),  
    cert: fs.readFileSync('./server.crt', 'utf8')  
}; 

https.createServer(options, app).listen(httpsPort, () => {  
    console.log("Server: Listening at port " + httpsPort);  
});  