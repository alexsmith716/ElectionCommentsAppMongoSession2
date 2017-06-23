
var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = function (req, res, cb) {

  res.locals.currentUser.checkPassword(req.body.data, function (err, result) {

    if (err) {

      cb(err)

    }

    if (!result) {

      cb({status: 201, response: 'error'})

    } else {

      if(req.body.doUserValidatedPassword){
        var nd = new Date()
        nd = nd.getTime()
        req.session.userValidatedPassword = {'isValidated': true, 'timeStamp': nd}
      }
      
      cb({status: 201, response: 'success'})

    }
  })
}
