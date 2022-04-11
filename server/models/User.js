const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken');
const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required: [true,'Please provider name'],
        minlength : 3,
        maxlength : 20,
        trim : true
    },
    lastName : {
        type : String,
        trim : true,
        maxlength : 30,
        default : 'Last Name'
    },
    email : {
            type : String,
            required: [true,'Please provider email'],
            unique : true,
            validate :{
                validator : validator.isEmail,
                message : 'Please provider  a valid email address'
            }

    },
    password : {
        type : String,
        required: [true,'Please provider password'],
        minlength : 6,
        select : false,
    },
    location : {
        type : String,
        trim : true,
        maxlength : 255,
        default : 'my city'
    }
})


UserSchema.pre('save', async function (req, res,next) {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password,salt);

    next();
})


UserSchema.methods.createJWT = function () {
    return jwt.sign({userId : this._id},process.env.JWT_SECRET, {expiresIn : process.env.JWT_LIFETIME})
}

const User = mongoose.model('User',UserSchema)
module.exports = User