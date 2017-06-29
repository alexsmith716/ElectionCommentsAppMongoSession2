
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (req, res, cb) {

  var expectedResponse = req.body.expectedResponse
  !expectedResponse ? expectedResponse = req.body.template.expectedResponse : null
  var email = req.body.email.trim()

  User.findOne( { emailX: emailX } ).exec(function (err, user) {

    if (err) {

      cb(err)

    } else {

      if (expectedResponse === 'false') {

        if (user) {

          cb(null, {status: 201, response: 'error', message: 'user email already exists'})

        } else {

          cb(null, {status: 201, response: 'success'})

        }

      } else {

        if (!user) {

          cb(null, {status: 201, response: 'error', message: 'user email not registered'})

        } else {

          cb(null, {status: 201, response: 'success'})

        }
      }
    }
  })
}
