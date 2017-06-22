

/*
module.exports = function CustomError(message, status, errStack, errName) {

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CustomError <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  Error.captureStackTrace(this, this.constructor)
  !errStack ? this.Stack = this.stack : this.Stack = errStack
  !errName ? this.name = this.constructor.name : this.name = errName
  this.name = this.constructor.name
  this.message = message
  this.status = status
  
}
*/

module.exports = function CustomError(message, status) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
  this.extra = status
}


require('util').inherits(module.exports, Error)
