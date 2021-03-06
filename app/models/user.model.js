//set mongoose database connecting
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
//import module for email validate
const validator = require('validator');
//format user collection
const UserSchema = mongoose.Schema({
    email:{
           type: String,
           unique : true,
           required : true,
           default: null,
           lowercase: true,
           validate: value => {
                     if (!validator.isEmail(value)) {
                        throw new Error({error: 'Invalid Email address'})
                     }}
    },
    password:{
              type: String,
              unique : false,
              required : true,
              default: null
    },
    companyName:{
                 type: String,
                 unique : false,
                 required : true,
                 default: null
    },
    companyPhone:{
                 type: String,
                 unique : false,
                 required : false,
                 default: null
    },
    contactName:{
                   type: String,
                   unique : false,
                   required : false,
                   default: null
    },
    address:{
             type: String,
             unique : false,
             required : false,
             default: null
    },
    license:{
             type: String,
             unique : true,
             required : true,
             default: null
    },
    isActive:{
              type: Boolean,
              unique : false,
              required : true,
              default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

//exporting module
module.exports = mongoose.model('User', UserSchema);