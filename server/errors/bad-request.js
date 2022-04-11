const {StatusCodes} = require('http-status-codes')
class BadRequestError extends Error {
    constructor(message){ 
        super(message);
        this.statusCode = StatusCodes.NOT_FOUND;
        
    }
}
module.exports = BadRequestError;