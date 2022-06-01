const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

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
        // required: [true,'Please provider password'],
        minlength : 6,
        select : false,
    },
    passwordConfirm : {
        type : String,
        // required: [true, 'Please confirm your password'],
        validate : {
            validator : function(el) {
                return el === this.password  ; // abc === abc return true  , else false 
                // this point current docs 
            },
            message : 'Please confirm correct password'
        },
        select : false,
    },
    facebookId :{
        type : String,
    },
    avatar:{
        type : String,
    },
    location : {
        type : String,
        trim : true,
        maxlength : 255,
        default : 'my city'
    },
    passwordResetToken : String,
    passwordResetExpires : Date
})



UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserSchema.set('toJSON', {
    virtuals: true,
});



UserSchema.pre('save', async function (req, res,next) {

    if(!this.isModified('password') && !this.isModified('passwordConfirm')) return 
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password,salt);
    this.passwordConfirm = await bcryptjs.hash(this.passwordConfirm,salt);
    // // delete password confirm fields
    // this.passwordConfirm = undefined;
    // next();
})


UserSchema.methods.createJWT = function () {
    return jwt.sign({userId : this._id},process.env.JWT_SECRET, {expiresIn : process.env.JWT_LIFETIME})
};

UserSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken =
     crypto.createHash('sha256')
     .update(resetToken)
     .digest('hex');

    console.log({resetToken}, this.passwordResetToken );

    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

    return resetToken;
}
// available in req.body , mỗi khi gọi hàm
UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcryptjs.compare(candidatePassword,this.password);
    return isMatch

}



const User = mongoose.model('User',UserSchema)
module.exports = User