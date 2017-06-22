
var User = require('../theAPI/model/userSchema.js')
var customError = require('./customError.js')

module.exports = function (req, res, doUserValidatedEmail, cb) {

  var email = req.body.data.trim()

  // email = ''

  User.findOne( { email: email } ).exec(function (err, user) {

    if(doUserValidatedEmail === true){
      // err = new Error('Bad Request')
      // err.status = 400
      // user = false
    }

    if (err) {

      return next(err)

    } else {

      if (!user) {

        cb({status: 201, response: 'error'})

      } else {

        if (user.email === res.locals.currentUser.email) {

          if(doUserValidatedEmail){
            var nd = new Date()
            nd = nd.getTime()
            req.session.userValidatedEmail = {'isValidated': true, 'timeStamp': nd}
          }

          cb({status: 201, response: 'success'})

        } else {

          cb({status: 201, response: 'error'})

        }
      }
    }
  })
}
