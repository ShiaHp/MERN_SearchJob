const User = require ('../models/User')
const {StatusCodes} = require('http-status-codes')
const register = async (req, res,next) => {
 
 const user = await User.create(req.body);
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