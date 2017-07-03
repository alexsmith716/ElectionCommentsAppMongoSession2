
var mongoose = require('mongoose')
var crypto = require('crypto')

/*
User
    > User can create MainComments
    > User can SubComment on other User's MainComments
*/

var statesArray = ['AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

var pattern = {
  displayname: /^[A-Za-z0-9_]{4,21}$/,
  email: /^\S+@\S+\.\S+/,
  password: /^\S{4,}$/,
  password2: /^[\S]{4,}$/,
  basicTextMaxLength: /^(?=\s*\S)(.{1,35})$/,
  basicText: /^(?=\s*\S)(.{1,})$/,
  textSpaceMaxLengthOnly: /^[a-zA-Z ]{1,35}$/,
  tester1: /\d{2,4}/,
  tester2: /abc/
}

var userSchema = new mongoose.Schema({
  email: {
      type: String,
      required: true,
      unique: true,
      match: pattern.email
  },
  displayname: {
      type: String,
      required: true,
      unique: false,
      match: pattern.displayname
  },
  firstname: {
      type: String,
      required: true,
      match: pattern.basicTextMaxLength
  },
  lastname: {
      type: String,
      required: true,
      match: pattern.basicTextMaxLength
  },
  city: {
      type: String,
      required: true,
      match: pattern.basicTextMaxLength
  },
  state: {
      type: String,
      required: true,
      uppercase: true,
      enum: statesArray
  },
  datecreated: { 
      type: Date, 
      default: Date.now
  },
  previouslogin: { 
      type: Date,
      default: Date.now
  },
  lastlogin: { 
      type: Date,
      default: Date.now
  },
  hash: String,
  salt: String
})


// randomBytes:     create salt
// pbkdf2:          create hash from password & salt (asynch)
// pbkdf2Sync:      create hash from password & salt (synch)

// crypto.randomBytes(     size,        cb
// crypto.randomBytes(      256,    function(err, buf)

// crypto.pbkdf2(  password,    salt,     iterations,   keylen,    digest,        cb
// crypto.pbkdf2(  password,  self.salt,    100000,       512,    'sha512',   function(err, key)

userSchema.pre('save', function (next) {
  next()
})

userSchema.methods.setPassword = function (password, cb) {

  var self = this

  crypto.randomBytes(64, function (err, buf) {

    if (err) {
      return cb(err)
    }

    var salt = buf.toString('hex')
    self.salt = salt

    crypto.pbkdf2(password, self.salt, 1000, 64, 'sha512', function (err, key) {

      if (err) {
        return cb(err)
      }

      var hash = key.toString('hex')
      self.hash = hash
      cb(null, self)
    })
  })
}

userSchema.methods.checkPassword = function (password, cb) {
  
  var result
  var self = this

  crypto.pbkdf2(password, self.salt, 1000, 64, 'sha512', function (err, key) {

    if (err) {
      return cb(err)
    }

    var hash = key.toString('hex')
    self.hash === hash ? result = true : result = false
    cb(null, result)
  })
}

mongoose.model('User', userSchema)
