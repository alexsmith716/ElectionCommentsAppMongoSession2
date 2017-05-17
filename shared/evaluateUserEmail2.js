
var User = require('../theAPI/model/userSchema.js')

module.exports = function (req, res, callback) {

  var email = req.body.data.trim()

  User.findOne( { email: email } ).exec(function (err, user) {

    if (err) {

      callback({status: 'err', response: 'error', message: err})

    } else {

      if (!user) {

        callback({status: 201, response: 'error'})

      } else {

        if (user.email === res.locals.currentUser.email) {

          var nd = new Date()
          nd = nd.getTime()
          req.session.userValidatedEmail = {'validated': true, 'time': nd}

          callback({status: 201, response: 'success'})

        } else {

          callback({status: 201, response: 'error'})

        }

      }

    }
  })
}
