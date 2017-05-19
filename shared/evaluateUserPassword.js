
var User = require('../theAPI/model/userSchema.js')

module.exports = function (req, res, doUserValidatedPassword, cb) {

  console.log('## evaluateUserPassword > res.locals.currentUser', res.locals.currentUser)
  console.log('## evaluateUserPassword > type:', req.body.type)
  console.log('## evaluateUserPassword > data:', req.body.data)
  console.log('## evaluateUserPassword > expectedResponse:', req.body.expectedResponse)
  console.log('## evaluateUserPassword > testUser:', req.body.testUser)

  res.locals.currentUser.checkPassword(req.body.data, function(err, result) {

    if(doUserValidatedPassword === false){
      // err = new Error('Bad Request')
      // err.status = 400
      // user = false
    }

    if (err) {

      cb({status: 'err', response: 'error', message: err})
    }

    if (!result) {

      cb({status: 201, response: 'error'})

    } else {

      if(doUserValidatedPassword){
        var nd = new Date()
        nd = nd.getTime()
        req.session.userValidatedPassword = {'validated': true, 'time': nd}
      }
      

      cb({status: 201, response: 'success'})

    }
  })
}
