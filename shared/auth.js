
var sendJSONresponse = function(res, status, content) {
  res.status(status)
  res.json(content)
}

var exceptionError = {'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyerror'}

module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    // res.redirect('/loginorsignup')
    var newExceptionError = new Error('Bad Request')
    newExceptionError.status = 400
    return next(newExceptionError)
  }
}

module.exports.ensureAuthenticatedAPI = function (req, res, next) {
  var hAuth = req.headers['authorization']
  var expr = /Basic/
  if (hAuth !== undefined && expr.test(hAuth)) {
    return next()
  } else {
    sendJSONresponse(res, 400, exceptionError)
  }
}

// reaching this this middleware means user is authenticated and has validated their email (if changing email or password) and password (if changing password)
// a time limit is ticking, so user has 5 minutes to submit form from last email/password verification
// that is what this is middleware verifying
module.exports.ensureAuthenticatedNewUserDataItem = function (req, res, next) {

  var u =  req.body.type.charAt(0).toUpperCase()+req.body.type.slice(1)
  var nd = new Date()

  if (req.body.type === 'email' && req.session.userValidatedEmail.validated) {

    var dmillis = nd.getTime() - req.session.userValidatedEmail.time
    var dmillis = new Date(dmillis)

    req.session.userValidatedEmail.validated = false

    if (dmillis.getMinutes() > 1) {

      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' You\'re request to change the '+ u +' has timed out. Please try changing your '+ u +' again.' })

    } else {

      return next()

    }

  }

  if (req.body.type === 'password' && req.session.userValidatedEmail.validated && req.session.userValidatedPassword.validated) {

    var pmillis = nd.getTime() - req.session.userValidatedPassword.time
    var pmillis = new Date(pmillis)

    req.session.userValidatedEmail.validated = false
    req.session.userValidatedPassword.validated = false

    if(pmillis.getMinutes() > 1){

      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' You\'re request to change the '+ u +' has timed out. Please try changing your '+ u +' again.' })

    } else {

      return next()

    }

  } else {

    sendJSONresponse(res, 400, exceptionError)

  }

}

module.exports.noCache = function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    //res.header('Expires', '-1')
    //res.header('Pragma', 'no-cache')
    return next()
}
