const {StatusCodes} = require('http-status-codes')





const errorHandleMessage = (err,req,res,next) => {
    console.log(err.message)
    const defaultError = {
       statusCode :err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
       msg  : err.message ||  'Something went wrong . Please try again later'
    }

    if(err.name === 'ValidationError') {
        defaultError.statusCode = StatusCodes.BAD_REQUEST
        // defaultError.msg = err.message
        defaultError.msg = Object.values(err.errors).map((item) => item.message).join(',');

    }
    if(err.code && err.code === 11000){
        defaultError.statusCode = StatusCodes.BAD_REQUEST;
        defaultError.msg = `${Object.keys(err.keyValue)} field has to be unique`;
    }
    // khởi tạo giá trị object, nếu gặp lỗi như trên thì gán lại giá trị cho obj
    // res.status(defaultError.statusCode).json({
    //     msg: err
    // })
       res.status(defaultError.statusCode).json({
        msg: defaultError.msg
    })
}

module.exports = errorHandleMessage