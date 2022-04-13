const User = require ('../models/User')
const {StatusCodes} = require('http-status-codes')

const {BadRequestError,NotFoundError,Unauthenticated} = require('../errors/index')



const register = async (req, res,next) => {
    const {name,email,password} = req.body;


    if(!name || !email || !password) {
        throw new BadRequestError('Please provide all values');

    }
    const userAlreadyExists = await User.findOne({ email});

    if(userAlreadyExists){
        throw new BadRequestError('Email already in use');
    }
    const user = await User.create({name,email,password});
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


const updateUser = (req, res) => {
    res.send('update user');
    User.findOneAndUpdate
}

module.exports = { register,login,updateUser}