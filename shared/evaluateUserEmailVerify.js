
var User = require('../theAPI/model/userSchema.js')

module.exports = function (req, res, doUserValidatedEmail, cb) {

  console.log('####### evaluateUserEmailVerify 1 req.body:', req.body)

  var email = req.body.data.trim()

  User.findOne( { email: email } ).exec(function (err, user) {

    if(doUserValidatedEmail === false){
      // err = new Error('Bad Request')
      // err.status = 400
      // user = false
    }

    if (err) {

      cb({status: 'err', response: 'error', message: err})

    } else {

      if (!user) {

        cb({status: 201, response: 'error'})

      } else {

        if (user.email === res.locals.currentUser.email) {

          console.log('####### evaluateUserEmailVerify 2 +++++++')

          if(doUserValidatedEmail){
            console.log('####### evaluateUserEmailVerify 3 +++++++')
            var nd = new Date()
            nd = nd.getTime()
            req.session.userValidatedEmail = {'isValidated': true, 'timeStamp': nd}
          }

          cb({status: 201, response: 'success'})

        } else {

          console.log('####### evaluateUserEmailVerify 4 +++++++')

          cb({status: 201, response: 'error'})

        }
      }
    }
  })
}
