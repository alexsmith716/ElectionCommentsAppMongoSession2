
var User = require('../theAPI/model/userSchema.js')

module.exports = function (type, data, expectingARegisteredEmail, callback) {

  if (type === 'email') {

    var email = data.trim()
    
    User.findOne( { email: email } ).exec(function (err, user) {
      if (err) {
        callback({status: 'err', response: 'error', message: err})

      } else {
        if (expectingARegisteredEmail === 'false') {
          if (user) {
            callback({status: 201, response: 'error'})

          } else {
            callback({status: 201, response: 'success'})

          }

        } else {
          if (!user) {
            callback({status: 201, response: 'error'})

          } else {
            callback({status: 201, response: 'success'})

          }
        }
      }
    })

  // incoming data password is NOT TRIMMED !!!!!!
  } else {


  }
}
