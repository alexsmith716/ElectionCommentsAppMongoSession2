
module.exports = function CustomError(message, status, errStack) {

  Error.captureStackTrace(this, this.constructor)
  !errStack ? this.Stack = this.stack : this.Stack = errStack
  this.name = this.constructor.name
  this.message = message
  this.status = status
  
}

require('util').inherits(module.exports, Error)
