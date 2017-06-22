
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (reqEmail, expectedResponse, cb) {

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> evaluateUserEmail 1 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  var email = reqEmail.trim()

  User.findOne( { email: email } ).exec(function (err, user) {

    if (err) {

      return next(err)

    } else {

      if (expectedResponse === 'false') {

        if (user) {

          cb({status: 201, response: 'error', message: 'user email already exists'})

        } else {

          cb({status: 201, response: 'success'})

        }

      } else {

        if (!user) {

          cb({status: 201, response: 'error', message: 'user email not registered'})

        } else {

          cb({status: 201, response: 'success'})

        }
      }
    }
  })
}
