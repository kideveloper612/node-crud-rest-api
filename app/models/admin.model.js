const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

const validator = require('validator')
const bcrypt = require('bcrypt');

const AdminSchema = mongoose.Schema({
    username: {
        type: String,
              unique : true,
              required : true,
              default: null
    },
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

AdminSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


module.exports = mongoose.model('Admin', AdminSchema);