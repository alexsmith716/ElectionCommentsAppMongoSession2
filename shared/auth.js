
var sendJSONresponse = function(res, status, content) {
  res.status(status)
  res.json(content)
}

var exceptionError = {'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyerror'}

module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log('## auth > ensureAuthenticated +++++++++++ YES')
    return next()
  } else {
    console.log('## auth > ensureAuthenticated +++++++++++ NO')
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

module.exports.ensureAuthenticatedNewUserDataItem = function (req, res, next) {

  var u =  req.body.type.charAt(0).toUpperCase()+req.body.type.slice(1)
  var nd = new Date()

  console.log('## auth > ensureAuthenticatedNewUserDataItem +++++++++++ U1:', u)
  console.log('## auth > ensureAuthenticatedNewUserDataItem +++++++++++ U2:', req.session.userValidatedEmail.validated)
  console.log('## auth > ensureAuthenticatedNewUserDataItem +++++++++++ U3:', req.session.userValidatedEmail.time)

  if (req.body.type === 'email' && req.session.userValidatedEmail.validated) {

    var dmillis = nd.getTime() - req.session.userValidatedEmail.time
    console.log('## auth > ensureAuthenticatedNewUserDataItem +++++++++++ U4a:', nd.getTime())
    console.log('## auth > ensureAuthenticatedNewUserDataItem +++++++++++ U4b:', req.session.userValidatedEmail.time)
    var dmillis = new Date(dmillis)
    var foo = 'foo'

    req.session.userValidatedEmail.validated = false

    console.log('## auth > ensureAuthenticatedNewUserDataItem +++++++++++ U5:', dmillis.getMinutes())

    // if (foo === 'foo') {
    // if (dmillis.getMinutes() > 4) {
    if (dmillis.getMinutes() > 0) {

      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' You\'re request to change the '+ u +' has timed out. Please try changing your '+ u +' again.' })

    } else {
      return next()

    }
  } else if (req.body.type === 'password' && req.session.userValidatedEmail.validated && req.session.userValidatedPassword.validated) {
    var pmillis = nd.getTime() - req.session.userValidatedPassword.time

    req.session.userValidatedEmail.validated = false
    req.session.userValidatedPassword.validated = false

    // if (foo === 'foo') {
    // if (pmillis.getMinutes() > 4) {
    if (pmillis.getMinutes() > 0) {

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
