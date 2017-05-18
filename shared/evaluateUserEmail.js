
var User = require('../theAPI/model/userSchema.js')

module.exports = function (reqEmail, expectedResponse, cb) {

  var email = reqEmail.trim()

  User.findOne( { email: email } ).exec(function (err, user) {

    // err = new Error('Bad Request')
    // err.status = 400

    if (err) {

      cb({status: 'err', response: 'error', message: err})

    } else {

      if (expectedResponse === 'false') {

        if (user) {

          cb({status: 201, response: 'error'})

        } else {

          cb({status: 201, response: 'success'})

        }

      } else {

        if (!user) {

          cb({status: 201, response: 'error'})

        } else {

          cb({status: 201, response: 'success'})

        }
      }
    }
  })
}
