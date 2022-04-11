const User = require ('../models/User')
const {StatusCodes} = require('http-status-codes')

const {BadRequestError,NotFoundError} = require('../errors/index')



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
    res.status(StatusCodes.CREATED).json({ 
            messages : 'Success',
            user : user
         });
   
}

const login = (req, res) => {
    res.send('Login user')
}


const updateUser = (req, res) => {
    res.send('update user')
}

module.exports = { register,login,updateUser}