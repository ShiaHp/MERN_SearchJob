const mongoose = require('mongoose');
const validator = require('validator')
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
        minlength : 6
    },
    location : {
        type : String,
        trim : true,
        maxlength : 255,
        default : 'my city'
    }
})

const User = mongoose.model('User',UserSchema)
module.exports = User