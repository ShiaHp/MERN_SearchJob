const {StatusCodes} = require('http-status-codes')


const errorHandleMessage = (err,req,res,next) => {
    console.log(err)
    const defaultError = {
       statusCode : StatusCodes.INTERNAL_SERVER_ERROR,
       msg  : 'Something went wrong . Please try again later'
    }
    res.status(defaultError.statusCode).json({
        msg: err
    })
}

module.exports = errorHandleMessage