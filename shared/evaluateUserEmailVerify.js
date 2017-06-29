
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (req, res, cb) {

  var email = req.body.data.trim()

  User.findOne( { email: email } ).exec(function (err, user) {

    if (err) {

      cb(err)

    } else {

      if (!user) {

        cb(null, {status: 201, response: 'error'})

      } else {

        if (user.email === res.locals.currentUser.email) {

          if(req.body.doUserValidatedEmail){
            var nd = new Date()
            nd = nd.getTime()
            req.session.userValidatedEmail = {'isValidated': true, 'timeStamp': nd}
          }

          cb(null, {status: 201, response: 'success'})

        } else {

          cb(null, {status: 201, response: 'error'})

        }
      }
    }
  })
}
