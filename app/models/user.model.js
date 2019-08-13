// const mongoose = require('mongoose');

// const NoteSchema = mongoose.Schema({
//     title: String,
//     content: String
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Note', NoteSchema);

const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

const validator = require('validator')
const bcrypt = require('bcrypt');

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


UserSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})



module.exports = mongoose.model('User', UserSchema);
