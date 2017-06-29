
module.exports = function CustomErrorObject( name, message, status ) {

  Error.captureStackTrace(this, this.constructor)
  this.name = name
  this.message = message
  this.status = status

}

require('util').inherits(module.exports, Error)
