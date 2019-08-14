//set mongoose database connecting
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
//format key collection
const KeySchema = mongoose.Schema({
      key_stockNo:{
                   type: String,
                   unique : false,
                   required : true,
                   default: null
      },
      key_mac:{
               type: String,
               unique : false,
               required : true,
               default: null
      },
      license:{
               type: String,
               unique : true,
               required : true,
               default: null
      },
      last_detected_on:{
                        type: Date,
                        unique : false,
                        required : false,
                        default: null
      },
      last_detected_by:{
                        type: String,
                        unique : false,
                        required : false,
                        default: null
      },
      last_signal_strength:{
                            type: String,
                            unique : false,
                            required : false,
                            default: null
      }
}, {
    timestamps: true
});

KeySchema.index({key_stockNo: 1, key_mac: 1, license: 1}, {unique: true});

//exporting module
module.exports = mongoose.model('Key', KeySchema);
