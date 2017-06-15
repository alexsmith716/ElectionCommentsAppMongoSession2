
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (reqEmail, expectedResponse, cb) {

  console.log('###### ajaxEvaluateUserEmail > evaluateUserEmail email/resp: ', reqEmail, ' ::', expectedResponse)

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
