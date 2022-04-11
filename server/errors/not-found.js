const {StatusCodes} = require('http-status-codes')
class NotFoundError extends Error {
    constructor(message){
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
        
    }
}

module.exports =NotFoundError