
var User = require('../theAPI/model/userSchema.js')
var customError = require('./customError.js')

module.exports = function (req, res, doUserValidatedEmail, cb) {

  console.log('>>>>>>>>>>>>>>>>> evaluateUserEmailVerify <<<<<<<<<<<<<<<<<')

  var email = req.body.data.trim()

  email = ''

  User.findOne( { email: email } ).exec(function (err, user) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>> evaluateUserEmailVerify > ERR 1<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', err)

    if(doUserValidatedEmail === true){
      // err = new Error('Bad Request')
      // err.status = 400
      // user = false
    }

    if (err) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>> evaluateUserEmailVerify > ERR 2<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', err)

      cb({status: 'err', response: 'error', message: err})

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
