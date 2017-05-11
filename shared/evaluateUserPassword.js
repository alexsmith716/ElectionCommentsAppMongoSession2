
var User = require('../theAPI/model/userSchema.js')
var crypto = require('crypto');

module.exports = function (req, res, callback) {

  console.log('## evaluateUserPassword > res.locals.currentUser', res.locals.currentUser)
  console.log('## evaluateUserPassword > type:', req.body.type)
  console.log('## evaluateUserPassword > data:', req.body.data)
  console.log('## evaluateUserPassword > expectedResponse:', req.body.expectedResponse)
  console.log('## evaluateUserPassword > testUser:', req.body.testUser)


  // ++++++++++++++++++++++++++++++++++++++
  // take supplied password, and compare it to 
  // res.locals.currentUser ||| userSchema.methods.checkPassword
  // we have already verified user through User.findOne ( user.email === res.locals.currentUser.email )
  // so we do not have to User.findOne again

  res.locals.currentUser.checkPassword(req.body.data, function(err, result) {

  console.log('## evaluateUserPassword > checkPassword 1 +++++++')

    if (err) {

      console.log('## evaluateUserPassword > checkPassword 2 +++++++')
      callback({status: 'err', response: 'error', message: err})
    }

    if (!result) {

      console.log('## evaluateUserPassword > checkPassword 3 +++++++')
      callback({status: 201, response: 'error'})

    } else {

      console.log('## evaluateUserPassword > checkPassword 4 +++++++')
      callback({status: 201, response: 'success'})

    }
  })

}
