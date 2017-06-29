
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (req, res, cb) {

  res.locals.currentUser.checkPassword(req.body.data, function (err, password) {

    if (err) {

      cb(err)

    }

    if (!password) {

      cb(null, {status: 201, response: 'error'})

    } else {

      if(req.body.doUserValidatedPassword){
        var nd = new Date()
        nd = nd.getTime()
        req.session.userValidatedPassword = {'isValidated': true, 'timeStamp': nd}
      }
      
      cb(null, {status: 201, response: 'success'})

    }
  })
}
