const errorHandleMessage = (err,req,res,next) => {
    res.status(500).json({
        message: 'There was an error processing your request'
    })
}

module.exports = errorHandleMessage