
var User = require('../theAPI/model/userSchema.js')

module.exports = function (req, res, cb) {

  var email = req.body.data.trim()

  User.findOne( { email: email } ).exec(function (err, user) {

    // err = new Error('Bad Request')
    // err.status = 400

    if (err) {

      cb({status: 'err', response: 'error', message: err})

    } else {

      if (!user) {

        cb({status: 201, response: 'error'})

      } else {

        if (user.email === res.locals.currentUser.email) {

          var nd = new Date()
          nd = nd.getTime()
          req.session.userValidatedEmail = {'validated': true, 'time': nd}

          cb({status: 201, response: 'success'})

        } else {

          cb({status: 201, response: 'error'})

        }

      }

    }
  })
}
