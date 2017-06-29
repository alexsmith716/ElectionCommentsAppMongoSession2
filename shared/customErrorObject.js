
module.exports = function CustomErrorObject(message, status, errStack, errName) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CustomError <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
  Error.captureStackTrace(this, this.constructor)
  !errStack ? this.Stack = this.stack : this.Stack = errStack
  !errName ? this.name = this.constructor.name : this.name = errName
  this.message = message
  this.status = status
}

require('util').inherits(module.exports, Error)
