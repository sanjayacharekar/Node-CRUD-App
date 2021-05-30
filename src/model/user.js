const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email')
            }
        }
    },
    phone: {
        type: Number,
        required: true,
        // min: 10
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

});

// creating token when register time
userSchema.methods.generateAuthToken = async function(){
    try {
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }
    }
    

//hashing 

userSchema.pre("save", async function (next) {

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);

        this.cpassword = await bcrypt.hash(this.cpassword, 10);
        next();

    }
});

const User = mongoose.model("ProjectData", userSchema);

module.exports = User;