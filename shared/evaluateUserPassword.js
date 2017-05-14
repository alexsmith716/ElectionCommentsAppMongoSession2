
var User = require('../theAPI/model/userSchema.js')
var crypto = require('crypto');

module.exports = function (req, res, callback) {

  console.log('## evaluateUserPassword > res.locals.currentUser', res.locals.currentUser)
  console.log('## evaluateUserPassword > type:', req.body.type)
  console.log('## evaluateUserPassword > data:', req.body.data)
  console.log('## evaluateUserPassword > expectedResponse:', req.body.expectedResponse)
  console.log('## evaluateUserPassword > testUser:', req.body.testUser)

  res.locals.currentUser.checkPassword(req.body.data, function(err, result) {

    if (err) {

      callback({status: 'err', response: 'error', message: err})
    }

    if (!result) {

      callback({status: 201, response: 'error'})

    } else {

      var nd = new Date()
      nd = nd.getTime()
      req.session.userValidatedPassword = {'validated': true, 'time': nd}

      callback({status: 201, response: 'success'})

    }
  })

}
