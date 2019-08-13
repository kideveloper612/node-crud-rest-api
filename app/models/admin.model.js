//set mongoose connecting
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

//import module for validating email
const validator = require('validator')
const bcrypt = require('bcrypt');

//format of admin collection in mongoose database
//set for inserting the data of insert and update data
const AdminSchema = mongoose.Schema({    
    email: {
        type: String,
        unique: true,
        required: true,
        default: null,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    password: {
        type: String,
              unique : false,
              required : true,
              default: null
    }
},{
    timestamps: true
});

//confrim password before save
AdminSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//exporting module
module.exports = mongoose.model('Admin', AdminSchema);