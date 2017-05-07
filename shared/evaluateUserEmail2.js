
var User = require('../theAPI/model/userSchema.js')

module.exports = function (req, res, callback) {

  var email = req.body.data.trim()
  
  User.findOne( { email: email } ).exec(function (err, user) {

    if (err) {

      callback({status: 'err', response: 'error', message: err})

    } else {

      if(req.body.testUser){

        if (user.email === res.locals.currentUser.email) {

          callback({status: 201, response: 'success'})

        } else {

          callback({status: 201, response: 'error'})

        }

      } else if (req.body.expectedResponse === 'false') {

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
