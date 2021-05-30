const mongoose = require('mongoose');
const validator = require('validator');

const adduserSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        // unique: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email');
            }
        }
    },
    phone: {
        type: Number,
        required: true,
        // min: 10
    },
    comments: {
        type: String,
        // required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});



const AddUser = mongoose.model("Adduser", adduserSchema);

module.exports = AddUser;