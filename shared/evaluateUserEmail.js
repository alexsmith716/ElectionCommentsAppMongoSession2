
var User = require('../theAPI/model/userSchema.js')

module.exports = function (email1, expectingARegisteredEmail, callback) {
  var email2 = email1.trim()
  User.findOne( { email: email2 } ).exec(function (err, user) {
    if (err) {
      callback({status: 'err', response: 'error', message: err})

    } else {
      if (expectingARegisteredEmail === 'false') {
        if (user) {
          callback({status: 201, response: 'error'})

        } else {
          callback({status: 201, response: 'success'})

        }

      } else {
        if (!user) {
          callback({status: 201, response: 'error'})

        } else {
          callback({status: 201, response: 'success'})

        }
      }
    }
  })
}
