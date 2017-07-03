
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose')
var User = mongoose.model('User')

// In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request. If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.

// Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.

module.exports = function() {

  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  })

  passport.use('local', new LocalStrategy({ usernameField: 'email' }, function (username, password, done) {

      User.findOne({ email: username }, function (err, user) {

        if (err) { 
          return done(err)
        } 

        if (!user) {
          return done(null, false, { message: 'No user has that username!' })
        }

        user.checkPassword(password, function (err, result) {

          if (err) {
            return done(err)
          }

          if (!result) {
            return done(null, false, { message: 'Invalid password.' })
          }

          done(null, user)

        })
      })
    }
  ))
}
