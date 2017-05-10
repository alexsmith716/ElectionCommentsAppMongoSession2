
var User = require('../theAPI/model/userSchema.js')

module.exports = function (req, res, callback) {

  var email = req.body.data.trim()

  console.log('## evaluateUserEmail2 > email:', email)
  
  User.findOne( { email: email } ).exec(function (err, user) {

    if (err) {

      console.log('## evaluateUserEmail2 > User.findOne > Err:', user)

      callback({status: 'err', response: 'error', message: err})

    } else {

      console.log('## evaluateUserEmail2 > User.findOne > user:', user)
      console.log('## evaluateUserEmail2 > User.findOne > req.body.testUser:', req.body.testUser)

      if (req.body.expectedResponse === 'false') {

        if (user) {
          callback({status: 201, response: 'error'})

        } else {
          callback({status: 201, response: 'success'})

        }

      } else {

        if (!user) {

          callback({status: 201, response: 'error'})

        } else {

          if (req.body.testUser) {

            if (user.email === res.locals.currentUser.email) {

              callback({status: 201, response: 'success'})

            } else {

              callback({status: 201, response: 'error'})

            }

          } else {

            callback({status: 201, response: 'success'})

          }

        }

      }

    }

  })
}
