const User = require ('../models/User')
const {StatusCodes} = require('http-status-codes')
const sendEmail = require('../utils/sendEmail')
const {BadRequestError,NotFoundError,Unauthenticated} = require('../errors/index')
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_LIFETIME
    })
}

const register = async (req, res,next) => {
    const {name,email,password,passwordConfirm } = req.body;


    if(!name || !email || !password || !passwordConfirm ) {
        throw new BadRequestError('Please provide all values');

    }
    const userAlreadyExists = await User.findOne({ email});

    if(userAlreadyExists){
        throw new BadRequestError('Email already in use');
    }
    const user = await User.create({name,email,password,passwordConfirm});
    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({ 
            messages : 'Success',
            token : token,
            user : {
                email : user.email,
                lastName : user.lastName,
                location : user.location,
                name : user.name,
            }
         });
   
}

const login =  async (req, res,) => {
    const {email, password} = req.body;
    if(!email || !password) {
        throw new BadRequestError('Please provide all values');
    };

    const user = await User.findOne({email}).select('+password')
    if(!user) {
        throw new Unauthenticated('Invalid Credentials');
    }
    console.log(user);

    const isPassword = await user.comparePassword(password);
    console.log(isPassword)
    if(!isPassword) {
        throw new Unauthenticated('Invalid Credentials');
    }

    const token = user.createJWT();
    user.password = undefined;

    res.status(StatusCodes.OK).json({
            user,token,location:user.location
    })
}


const updateUser =  async (req, res) => {
    const {email,name,lastName,location} = req.body;
    
    if(!email || !name || !lastName || !location ){
        throw new BadRequestError('Please provide all values')
    }

    const user  = await User.findOne({ _id : req.user.userId });
  
    user.email = email;
    user.name = name;
    user.location = location;
    user.lastName = lastName;
    await user.save();

    const token =  user.createJWT();
     res.status(StatusCodes.OK).json({ user,token,location : user.location });


};


const forgotPassword = async(req, res) => {

     const user = await User.findOne({
            email: req.body.email
        });

        if(!user) {
            throw new NotFoundError('There is no user with email ' )
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({validateBeforeSave  : false});

        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
        const message =  `Forgot your password ? Submit a PATCH request to reset your password and passwordConfirm to : ${resetURL} .
        \nIf you did't forget your password , please ignore this email!`;
        try{
          
                await sendEmail({
                    email : user.email,
                    subject : 'Your password reset token (valid for 10 minutes)',
                    message
                })
               
                res.status(StatusCodes.OK).json({
                    status : 'success',
                    message : 'Token send to email !'
                })
        } catch(e) {
           
            user.passwordResetToken = undefined;
            user.passwordResetExpires =undefined;
            await user.save({validateBeforeSave: false})
            throw new NotFoundError('There is no user with email ' )
              
        
        }
}

const resetPassword =async(req, res ,next) => {
    // 1, Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken : hashedToken ,
        passwordResetExpires : {$gt : Date.now()},
    });

    // 2,if token has not expired, and there is user ,set the new password 
    if(!user){
        throw new NotFoundError('Token is invalid')
    }
    user.password = req.body.password;
    user.passwordConfirm= req.body.passwordConfirm
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3, update changedPasswordAt props for the users


    // 4, log the user in , send JWT

    const token = signToken(user._id)
    // payload, secret key 
    res.status(201).json({
        status : 'success',
        token,

    })
}


module.exports = { register,login,updateUser, forgotPassword,resetPassword}