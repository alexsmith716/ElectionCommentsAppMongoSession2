
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (req, res, cb) {

  var expectedResponse = req.body.expectedResponse
  !expectedResponse ? expectedResponse = req.body.template.expectedResponse : null
  var email = req.body.email.trim()

  /*
  var promise = User.findOne( { email: email } ).exec()
  promise.then(function(user) {
    //
  })
  .then(function(user) {
    //
  })
  .catch(function(err){
    //
  })
  */

  // User.findOne( { email: email } ).exec(function (err, user) {
  User.findOne( { email : email }, function (err, user) {
    
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
